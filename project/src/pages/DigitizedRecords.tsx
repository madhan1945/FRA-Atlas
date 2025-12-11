import { useEffect, useRef, useState } from 'react';
import { Search, Download, Eye, FileText, Plus, UploadCloud, CheckCircle, XCircle } from 'lucide-react';
import { fraClaimsData, FRAClaim } from '../data/fraClaimsData';
import { statesList, districtsByState, villagesByDistrict } from '../data/locationData';
import { supabase, CLAIMS_TABLE, ATTACHMENTS_BUCKET } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth/AuthProvider';
import Tesseract from 'tesseract.js';
import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configure pdf.js worker from CDN (static version)
GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js';

const DigitizedRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { session } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  type ClaimRecord = FRAClaim & { attachments?: string[]; ocrPreview?: string; authorizationScore?: number };
  // Local claims persisted in localStorage
  const [claims, setClaims] = useState<ClaimRecord[]>(fraClaimsData as ClaimRecord[]);
  useEffect(() => {
    const load = async () => {
      if (supabase) {
        const { data, error } = await supabase.from(CLAIMS_TABLE).select('*').order('submission_date', { ascending: false });
        if (!error && Array.isArray(data)) {
          const normalized = data.map((r: any) => ({
            claimId: r.claim_id,
            claimantName: r.claimant_name,
            village: r.village,
            district: r.district,
            state: r.state,
            tribe: r.tribe,
            landAreaHa: Number(r.land_area_ha) || 0,
            status: r.status as FRAClaim['status'],
            submissionDate: r.submission_date,
            lastUpdated: r.last_updated,
            claimType: r.claim_type,
            attachments: r.attachments || [],
            ocrPreview: r.ocr_preview || '',
            authorizationScore: typeof r.authorization_score === 'number' ? r.authorization_score : undefined,
          })) as ClaimRecord[];
          setClaims(normalized);
          return;
        }
      }
      const saved = localStorage.getItem('va_claims');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setClaims(parsed);
        } catch {}
      } else {
        localStorage.setItem('va_claims', JSON.stringify(fraClaimsData));
      }
    };
    load();
  }, []);
  useEffect(() => {
    localStorage.setItem('va_claims', JSON.stringify(claims));
  }, [claims]);

  // Filter data based on search and filters
  const filteredData = claims.filter(record => {
    const matchesSearch = 
      record.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.claimId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || record.status === statusFilter;
    const matchesState = !stateFilter || record.state === stateFilter;
    
    return matchesSearch && matchesStatus && matchesState;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredData.slice(startIndex, startIndex + recordsPerPage);

  const getStatusBadge = (status: string) => {
    const styles = {
      Approved: 'bg-green-100 text-green-800 border-green-200',
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
      'Under Review': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const states = [...new Set(claims.map(record => record.state))];
  const statuses = [...new Set(claims.map(record => record.status))];

  // Claim modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    claimantName: '',
    village: '',
    district: '',
    state: '',
    tribe: '',
    landAreaHa: '',
    claimType: 'Individual Forest Rights'
  });
  const [uploading, setUploading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [authorizationScore, setAuthorizationScore] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [attachmentKeys, setAttachmentKeys] = useState<string[]>([]);
  const [detail, setDetail] = useState<ClaimRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [ocrLangMode, setOcrLangMode] = useState<'eng' | 'hin' | 'eng+hin'>('eng+hin');

  const resetClaimDraft = async () => {
    try {
      await Promise.all(attachmentKeys.map((k) => idbDel(k)));
    } catch {}
    setAttachmentKeys([]);
    setForm({ claimantName: '', village: '', district: '', state: '', tribe: '', landAreaHa: '', claimType: 'Individual Forest Rights' });
    setOcrText('');
    setIsAuthorized(null);
    setAuthorizationScore(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const computeAuthorizationScore = (text: string) => {
    const rules = [
      { k: 'Government of India', w: 2.0 },
      { k: 'Forest Rights Act', w: 2.0 },
      { k: 'Gram Sabha', w: 1.5 },
      { k: 'Panchayat', w: 1.0 },
      { k: 'Signature', w: 1.0 },
      { k: 'Seal', w: 1.0 },
      { k: 'Authority', w: 1.0 },
      { k: 'Certificate', w: 0.8 },
      { k: 'Verified', w: 0.8 },
    ];
    const lower = text.toLowerCase();
    const score = rules.reduce((sum, r) => sum + (lower.includes(r.k.toLowerCase()) ? r.w : 0), 0);
    const normalized = Math.min(1, score / 5);
    return normalized;
  };

  const extractTextFromPdf = async (file: File) => {
    const arrayBuf = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuf });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc: any = await page.getTextContent();
      const strings = tc.items?.map((it: any) => it.str) || [];
      fullText += strings.join(' ') + '\n';
    }
    return fullText;
  };

  const renderPdfPageToBlob = async (file: File, pageNumber: number, scale = 2) => {
    const arrayBuf = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuf });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas not supported');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    // @ts-ignore
    await page.render({ canvasContext: context, viewport }).promise;
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/png'));
  };

  const preprocessImageBlob = async (blob: Blob) => {
    const img = document.createElement('img');
    const url = URL.createObjectURL(blob);
    await new Promise((res, rej) => { img.onload = () => res(null); img.onerror = rej; img.src = url; });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) { URL.revokeObjectURL(url); return blob; }
    const maxDim = 2000;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    canvas.width = Math.floor(img.width * scale);
    canvas.height = Math.floor(img.height * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const gray = 0.299*r + 0.587*g + 0.114*b;
      // stronger thresholding
      const v = gray > 200 ? 255 : (gray < 120 ? 0 : gray);
      data[i] = data[i+1] = data[i+2] = v as number;
    }
    ctx.putImageData(imageData, 0, 0);
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => { URL.revokeObjectURL(url); resolve(b as Blob); }, 'image/png'));
  };

  const ocrBlob = async (blob: Blob): Promise<string> => {
    setOcrProgress(0);
    setOcrStatus('Initializing OCR...');
    const pre = await preprocessImageBlob(blob);
    const lang = ocrLangMode;
    const logger = (m: any) => {
      if (m.status) setOcrStatus(m.status);
      if (typeof m.progress === 'number') setOcrProgress(Math.round(m.progress * 100));
    };
    const runPass = async (psm: number) => {
      const res = await Tesseract.recognize(pre, lang, {
        logger,
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        tessedit_pageseg_mode: psm,
        preserve_interword_spaces: 1
      } as any);
      return res.data;
    };
    // try two modes and pick the best by confidence
    const a = await runPass(6); // assume block of text
    const b = a.confidence < 60 ? await runPass(3) : a; // fully automatic as fallback
    const best = (b.confidence || 0) >= (a.confidence || 0) ? b : a;
    return best.text || '';
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      let aggregatedText = '';
      const newKeys: string[] = [];
      for (const file of Array.from(files)) {
        const key = `va_att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await idbSet(key, file);
        newKeys.push(key);

        if (file.type === 'application/pdf') {
          // First try embedded text
          let pdfText = await extractTextFromPdf(file);
          if (!pdfText || pdfText.trim().length < 30) {
            // Rasterize first 4 pages for OCR fallback
            const arrayBuf = await file.arrayBuffer();
            const loadingTask = getDocument({ data: arrayBuf });
            const pdf = await loadingTask.promise;
            const pagesToScan = Math.min(pdf.numPages, 4);
            for (let i = 1; i <= pagesToScan; i++) {
              const blobImg = await renderPdfPageToBlob(file, i, 3);
              const pageText = await ocrBlob(blobImg);
              pdfText += `\n${pageText}`;
            }
          }
          aggregatedText += `\n${pdfText}`;
        } else {
          const text = await ocrBlob(file);
          aggregatedText += `\n${text || ''}`;
        }
      }
      setAttachmentKeys(prev => [...prev, ...newKeys]);
      setOcrText(prev => (prev ? `${prev}\n${aggregatedText}` : aggregatedText));
      const score = computeAuthorizationScore(aggregatedText);
      setAuthorizationScore(score);
      setIsAuthorized(score >= 0.6);
    } catch (e) {
      setIsAuthorized(false);
      setAuthorizationScore(0);
    } finally {
      setUploading(false);
      setOcrStatus('');
      setOcrProgress(0);
    }
  };

  const submitClaim = async () => {
    const idSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const newClaim: ClaimRecord = {
      claimId: `FRA/${(form.state || 'NA').slice(0,2).toUpperCase()}/${(form.district || 'GEN').slice(0,3).toUpperCase()}/2025/${idSuffix}`,
      claimantName: form.claimantName || 'Unknown',
      village: form.village || 'Unknown',
      district: form.district || 'Unknown',
      state: form.state || 'Unknown',
      tribe: form.tribe || 'Unknown',
      landAreaHa: Number(form.landAreaHa) || 0,
      status: (isAuthorized ? 'Under Review' : 'Pending'),
      submissionDate: new Date().toISOString().slice(0,10),
      lastUpdated: new Date().toISOString().slice(0,10),
      claimType: form.claimType,
      attachments: attachmentKeys,
      ocrPreview: ocrText.slice(0, 1000),
      authorizationScore: authorizationScore ?? 0
    };
    setClaims((prev: ClaimRecord[]) => [newClaim, ...prev]);
    if (supabase) {
      const payload = {
        claim_id: newClaim.claimId,
        claimant_name: newClaim.claimantName,
        village: newClaim.village,
        district: newClaim.district,
        state: newClaim.state,
        tribe: newClaim.tribe,
        land_area_ha: newClaim.landAreaHa,
        status: newClaim.status,
        claim_type: newClaim.claimType,
        submission_date: newClaim.submissionDate,
        last_updated: newClaim.lastUpdated,
        authorization_score: newClaim.authorizationScore,
        ocr_preview: newClaim.ocrPreview,
        attachments: newClaim.attachments || [],
      };
      await supabase.from(CLAIMS_TABLE).insert(payload);
    }
    setIsModalOpen(false);
    setForm({ claimantName: '', village: '', district: '', state: '', tribe: '', landAreaHa: '', claimType: 'Individual Forest Rights' });
    setOcrText('');
    setIsAuthorized(null);
    setAuthorizationScore(null);
    setAttachmentKeys([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 text-purple-600 mr-3" />
            Digitized FRA Records
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Make A Claim
            </button>
          </div>
          <p className="text-lg text-gray-600">
            Access and search through digitized Forest Rights Act claims and community records
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-2xl font-bold text-blue-600">{claims.length}</div>
            <div className="text-gray-600">Total Claims</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-2xl font-bold text-green-600">
              {claims.filter(r => r.status === 'Approved').length}
            </div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-2xl font-bold text-yellow-600">
              {claims.filter(r => r.status === 'Pending').length}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-2xl font-bold text-purple-600">
              {claims.reduce((sum, record) => sum + record.landAreaHa, 0).toFixed(1)} ha
            </div>
            <div className="text-gray-600">Total Area</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, village, or claim ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md transition-colors flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claimant Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Village/District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Land Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.map((record) => (
                  <tr key={record.claimId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.claimId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{record.claimantName}</div>
                        <div className="text-gray-500 text-xs">{record.tribe}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{record.village}</div>
                        <div className="text-gray-500 text-xs">{record.district}, {record.state}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.landAreaHa} ha
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.submissionDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button onClick={() => setDetail(record)} className="text-blue-600 hover:text-blue-800 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + recordsPerPage, filteredData.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredData.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {detail && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Claim Details - {detail.claimId}</h2>
                <button onClick={() => setDetail(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Claimant</div>
                  <div>{detail.claimantName} ({detail.tribe})</div>
                </div>
                <div>
                  <div className="font-medium">Location</div>
                  <div>{detail.village}, {detail.district}, {detail.state}</div>
                </div>
                <div>
                  <div className="font-medium">Area</div>
                  <div>{detail.landAreaHa} ha</div>
                </div>
                <div>
                  <div className="font-medium">Status</div>
                  <div>{detail.status}</div>
                </div>
                {typeof (detail as any).authorizationScore === 'number' && (
                  <div className="md:col-span-2">
                    <div className="font-medium">Authorization Score</div>
                    <div className="mt-1 w-full bg-gray-200 rounded h-2">
                      <div className="bg-green-600 h-2 rounded" style={{ width: `${Math.round(((detail as any).authorizationScore as number) * 100)}%` }} />
                    </div>
                  </div>
                )}
                {(detail as any).ocrPreview && (
                  <div className="md:col-span-2">
                    <div className="font-medium mb-1">OCR Preview</div>
                    <div className="p-2 border rounded max-h-40 overflow-auto whitespace-pre-wrap text-xs">
                      {(detail as any).ocrPreview}
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <div className="font-medium mb-1">Attachments</div>
                  <div className="flex flex-wrap gap-2">
                    {((detail as any).attachments || []).map((key: string, idx: number) => (
                      <button
                        key={key}
                        onClick={async () => {
                          if (!session) return; // Block downloads if not logged-in
                          const blob: any = await idbGet(key);
                          if (!blob) return;
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `attachment_${idx+1}`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        }}
                        disabled={!session}
                        className={`px-3 py-1 text-xs rounded border ${session ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
                      >
                        Download #{idx + 1}
                      </button>
                    ))}
                    {((detail as any).attachments || []).length === 0 && (
                      <span className="text-xs text-gray-500">No attachments</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 text-right">
                <button onClick={() => setDetail(null)} className="px-4 py-2 rounded border">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Claim Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Make A Claim</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Claimant Name</label>
                  <input
                    value={form.claimantName}
                    onChange={(e) => setForm({ ...form, claimantName: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tribe</label>
                  <input
                    value={form.tribe}
                    onChange={(e) => setForm({ ...form, tribe: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., Santhal"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value, district: '', village: '' })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select State</option>
                    {statesList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">District</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value, village: '' })}
                    disabled={!form.state}
                    className="w-full p-2 border rounded disabled:bg-gray-100"
                  >
                    <option value="">{form.state ? 'Select District' : 'Select a State first'}</option>
                    {(districtsByState[form.state] || []).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Village</label>
                  <select
                    value={form.village}
                    onChange={(e) => setForm({ ...form, village: e.target.value })}
                    disabled={!form.district}
                    className="w-full p-2 border rounded disabled:bg-gray-100"
                  >
                    <option value="">{form.district ? 'Select Village' : 'Select a District first'}</option>
                    {(villagesByDistrict[form.district] || []).map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Land Area (ha)</label>
                  <input
                    type="number"
                    value={form.landAreaHa}
                    onChange={(e) => setForm({ ...form, landAreaHa: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Claim Type</label>
                  <select
                    value={form.claimType}
                    onChange={(e) => setForm({ ...form, claimType: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option>Individual Forest Rights</option>
                    <option>Community Forest Rights</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Upload Supporting Documents</span>
                  </div>
                  {isAuthorized === true && (
                    <span className="inline-flex items-center text-green-700 text-sm"><CheckCircle className="h-4 w-4 mr-1" /> Authorized</span>
                  )}
                  {isAuthorized === false && (
                    <span className="inline-flex items-center text-red-700 text-sm"><XCircle className="h-4 w-4 mr-1" /> Not Authorized</span>
                  )}
                </div>
                <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
                  <span>OCR Language:</span>
                  <select value={ocrLangMode} onChange={(e) => setOcrLangMode(e.target.value as any)} className="border rounded px-2 py-1">
                    <option value="eng">English</option>
                    <option value="hin">Hindi</option>
                    <option value="eng+hin">English + Hindi</option>
                  </select>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={async (e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);
                    if (supabase) {
                      // upload to Supabase Storage (store public URLs as attachments)
                      setUploading(true);
                      try {
                        const newKeys: string[] = [];
                        let aggregatedText = '';
                        for (const f of files) {
                          const path = `${Date.now()}_${Math.random().toString(36).slice(2,8)}_${f.name}`;
                          const { data, error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, f, { upsert: false });
                          if (!error && data) {
                            const { data: pub } = supabase.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(path);
                            if (pub?.publicUrl) newKeys.push(pub.publicUrl);
                          }
                          // OCR for each file as well
                          if (f.type === 'application/pdf') {
                            let pdfText = await extractTextFromPdf(f);
                            if (!pdfText || pdfText.trim().length < 30) {
                              const arrayBuf = await f.arrayBuffer();
                              const loadingTask = getDocument({ data: arrayBuf });
                              const pdf = await loadingTask.promise;
                              const pagesToScan = Math.min(pdf.numPages, 4);
                              for (let i = 1; i <= pagesToScan; i++) {
                                const blobImg = await renderPdfPageToBlob(f, i, 3);
                                const pageText = await ocrBlob(blobImg);
                                pdfText += `\n${pageText}`;
                              }
                            }
                            aggregatedText += `\n${pdfText}`;
                          } else {
                            const text = await ocrBlob(f);
                            aggregatedText += `\n${text || ''}`;
                          }
                        }
                        if (aggregatedText.trim()) {
                          setOcrText(prev => (prev ? `${prev}\n${aggregatedText}` : aggregatedText));
                          const score = computeAuthorizationScore(aggregatedText);
                          setAuthorizationScore(score);
                          setIsAuthorized(score >= 0.6);
                        }
                        setAttachmentKeys(prev => [...prev, ...newKeys]);
                      } finally {
                        setUploading(false);
                        setOcrStatus('');
                        setOcrProgress(0);
                      }
                    } else {
                      await handleFiles(e.target.files);
                    }
                  }}
                />
                <div className="mt-3 text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-auto">
                  {uploading ? (`${ocrStatus} ${ocrProgress ? `(${ocrProgress}%)` : ''}`) : (ocrText ? ocrText.slice(0, 800) : 'Text will appear here after OCR.')}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={async () => { await resetClaimDraft(); setIsModalOpen(false); }}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button onClick={submitClaim} className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50" disabled={uploading}>
                  Submit Claim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitizedRecords;