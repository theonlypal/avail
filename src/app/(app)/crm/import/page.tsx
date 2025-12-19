"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";

interface ImportResult {
  success: boolean;
  message: string;
  results: {
    imported: number;
    skipped: number;
    errors: string[];
  };
}

export default function CRMImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teamId = "default-team";

  function parseCSV(text: string): any[] {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }

    // Parse header
    const headerLine = lines[0];
    const headers = parseCSVRow(headerLine).map(h => h.toLowerCase().trim().replace(/\s+/g, '_'));

    // Map common header variations
    const headerMap: Record<string, string> = {
      'first_name': 'first_name',
      'firstname': 'first_name',
      'first': 'first_name',
      'last_name': 'last_name',
      'lastname': 'last_name',
      'last': 'last_name',
      'email': 'email',
      'email_address': 'email',
      'phone': 'phone',
      'phone_number': 'phone',
      'telephone': 'phone',
      'company': 'company',
      'company_name': 'company',
      'organization': 'company',
      'title': 'title',
      'job_title': 'title',
      'position': 'title',
      'lifecycle_stage': 'lifecycle_stage',
      'stage': 'lifecycle_stage',
      'status': 'lifecycle_stage',
    };

    const normalizedHeaders = headers.map(h => headerMap[h] || h);

    // Parse data rows
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVRow(lines[i]);
      const row: any = {};
      normalizedHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  }

  function parseCSVRow(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return values;
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseCSV(text);

        // Validate required columns
        const requiredColumns = ['first_name', 'last_name', 'email'];
        const hasRequired = requiredColumns.every(col =>
          data.length > 0 && col in data[0]
        );

        if (!hasRequired) {
          throw new Error('CSV must contain columns: First Name, Last Name, Email');
        }

        setCsvData(data);
      } catch (err: any) {
        setParseError(err.message);
        setCsvData([]);
      }
    };
    reader.readAsText(selectedFile);
  }

  async function handleImport() {
    if (csvData.length === 0) return;

    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: teamId,
          contacts: csvData,
        }),
      });

      const result = await res.json();
      setImportResult(result);

      if (result.success) {
        setCsvData([]);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Import failed',
        results: { imported: 0, skipped: csvData.length, errors: ['Network error'] },
      });
    } finally {
      setImporting(false);
    }
  }

  async function handleExport() {
    window.location.href = `/api/contacts/export?team_id=${teamId}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/crm"
            className="p-2 rounded-lg bg-slate-800/50 border border-white/10 hover:border-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-cyan-400" />
              Import / Export
            </h1>
            <p className="text-slate-400 mt-1">
              Import contacts from CSV or export your data
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Import Section */}
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-400" />
              Import Contacts
            </h2>

            <p className="text-sm text-slate-400 mb-4">
              Upload a CSV file with columns: First Name, Last Name, Email. Optional: Phone, Company, Title, Lifecycle Stage.
            </p>

            {/* File Input */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-white/20 hover:border-cyan-500/50 transition-colors cursor-pointer bg-slate-900/30"
              >
                <FileText className="h-8 w-8 text-slate-500" />
                <div className="text-center">
                  <p className="text-sm text-slate-300">
                    {file ? file.name : 'Click to select CSV file'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Max 1,000 contacts per import
                  </p>
                </div>
              </label>
            </div>

            {/* Parse Error */}
            {parseError && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-300">{parseError}</div>
              </div>
            )}

            {/* Preview */}
            {csvData.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">
                    Preview ({csvData.length} contacts)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCsvData([]);
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="h-7 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="max-h-48 overflow-auto rounded-lg bg-slate-900/50 border border-white/10 text-xs">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-slate-900">
                      <tr>
                        <th className="px-3 py-2 text-left text-slate-400">Name</th>
                        <th className="px-3 py-2 text-left text-slate-400">Email</th>
                        <th className="px-3 py-2 text-left text-slate-400">Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="px-3 py-2 text-slate-300">
                            {row.first_name} {row.last_name}
                          </td>
                          <td className="px-3 py-2 text-slate-400">{row.email}</td>
                          <td className="px-3 py-2 text-slate-500">{row.company || '-'}</td>
                        </tr>
                      ))}
                      {csvData.length > 10 && (
                        <tr className="border-t border-white/5">
                          <td colSpan={3} className="px-3 py-2 text-center text-slate-500">
                            ... and {csvData.length - 10} more
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={csvData.length === 0 || importing}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {csvData.length > 0 ? `${csvData.length} Contacts` : 'Contacts'}
                </>
              )}
            </Button>
          </div>

          {/* Export Section */}
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-emerald-400" />
              Export Contacts
            </h2>

            <p className="text-sm text-slate-400 mb-6">
              Download all your contacts as a CSV file. This includes name, email, phone, company, and other fields.
            </p>

            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Contacts
            </Button>

            <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-white/10">
              <h3 className="text-sm font-medium text-white mb-2">Export includes:</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>- First Name, Last Name</li>
                <li>- Email, Phone</li>
                <li>- Company, Job Title</li>
                <li>- Lifecycle Stage</li>
                <li>- Source, Created Date</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`mt-6 p-6 rounded-2xl border ${
            importResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-start gap-4">
              {importResult.success ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold ${importResult.success ? 'text-emerald-300' : 'text-red-300'}`}>
                  {importResult.message}
                </h3>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-emerald-400">
                    {importResult.results.imported} imported
                  </span>
                  {importResult.results.skipped > 0 && (
                    <span className="text-amber-400">
                      {importResult.results.skipped} skipped
                    </span>
                  )}
                </div>
                {importResult.results.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-1">Errors:</p>
                    <div className="max-h-32 overflow-auto text-xs text-red-300 space-y-1">
                      {importResult.results.errors.slice(0, 10).map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                      {importResult.results.errors.length > 10 && (
                        <p className="text-slate-500">
                          ... and {importResult.results.errors.length - 10} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sample CSV */}
        <div className="mt-6 p-6 rounded-2xl bg-slate-800/30 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Sample CSV Format</h3>
          <div className="rounded-lg bg-slate-900/50 p-4 font-mono text-xs text-slate-400 overflow-x-auto">
            <pre>{`First Name,Last Name,Email,Phone,Company,Title,Lifecycle Stage
John,Doe,john@example.com,+1-555-0100,Acme Inc,CEO,lead
Jane,Smith,jane@example.com,+1-555-0101,Tech Corp,CTO,qualified`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
