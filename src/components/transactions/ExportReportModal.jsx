import React, { useState, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { formatRupiah, formatDateIndo } from "../../utils/formatters";
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
  Sparkles,
  FileText,
} from "lucide-react";

export const ExportReportModal = () => {
  const { isReportModalOpen, setIsReportModalOpen, transactions, user } = useFinance();

  // Presets: 'hari_ini' | 'bulan_ini' | 'pilih_bulan' | '4_bulan' | 'custom'
  const [timeframe, setTimeframe] = useState("bulan_ini");
  
  // Custom date ranges
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthStr = todayStr.slice(0, 7); // "YYYY-MM"

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'income' | 'expense'

  // Hitung rentang tanggal efektif berdasarkan preset
  const { effectiveStart, effectiveEnd, periodLabel } = useMemo(() => {
    const now = new Date();

    if (timeframe === "hari_ini") {
      return {
        effectiveStart: todayStr,
        effectiveEnd: todayStr,
        periodLabel: `Hari Ini (${formatDateIndo(todayStr)})`,
      };
    }

    if (timeframe === "bulan_ini") {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      const start = `${year}-${month}-01`;
      const end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
      const monthName = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      return {
        effectiveStart: start,
        effectiveEnd: end,
        periodLabel: `Bulan Ini (${monthName})`,
      };
    }

    if (timeframe === "pilih_bulan") {
      if (!selectedMonth) {
        return { effectiveStart: todayStr, effectiveEnd: todayStr, periodLabel: "Pilih Bulan" };
      }
      const [year, m] = selectedMonth.split("-").map(Number);
      const lastDay = new Date(year, m, 0).getDate();
      const start = `${year}-${String(m).padStart(2, "0")}-01`;
      const end = `${year}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const dateObj = new Date(year, m - 1, 1);
      const monthName = dateObj.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      return {
        effectiveStart: start,
        effectiveEnd: end,
        periodLabel: `Bulan ${monthName}`,
      };
    }

    if (timeframe === "4_bulan") {
      const past = new Date();
      past.setMonth(past.getMonth() - 4);
      const start = past.toISOString().split("T")[0];
      return {
        effectiveStart: start,
        effectiveEnd: todayStr,
        periodLabel: `4 Bulan Terakhir (${formatDateIndo(start)} - ${formatDateIndo(todayStr)})`,
      };
    }

    // Custom
    return {
      effectiveStart: startDate || todayStr,
      effectiveEnd: endDate || todayStr,
      periodLabel: `Kustom (${formatDateIndo(startDate || todayStr)} - ${formatDateIndo(endDate || todayStr)})`,
    };
  }, [timeframe, selectedMonth, startDate, endDate, todayStr]);

  // Filter transaksi berdasarkan rentang tanggal & jenis
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = tx.date;
      const withinDate = txDate >= effectiveStart && txDate <= effectiveEnd;
      const matchesType = typeFilter === "all" || tx.type === typeFilter;
      return withinDate && matchesType;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, effectiveStart, effectiveEnd, typeFilter]);

  // Ringkasan
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === "income") income += Number(t.amount);
      if (t.type === "expense") expense += Number(t.amount);
    });
    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  if (!isReportModalOpen) return null;

  // ==========================================
  // GENERATOR CETAK / UNDUH PDF RESMI
  // ==========================================
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Harap izinkan pop-up browser untuk membuka dokumen laporan PDF.");
      return;
    }

    const reportNo = `FIN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const printDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const rowsHtml = filteredTransactions.map((tx, idx) => {
      const isIncome = tx.type === "income";
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: center; color: #64748B; font-size: 12px;">${idx + 1}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-weight: 500; color: #1E293B;">${formatDateIndo(tx.date)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-weight: 600; color: #0F172A;">
            ${tx.title}
            ${tx.note ? `<div style="font-size: 11px; font-weight: 400; color: #64748B; margin-top: 2px;">Catatan: ${tx.note}</div>` : ""}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #475569;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; background-color: #F1F5F9; font-size: 11px; font-weight: 500;">${tx.category}</span>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #475569;">${tx.paymentMethod || "Transfer"}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-weight: 600; text-align: center; color: ${isIncome ? "#059669" : "#E11D48"};">
            ${isIncome ? "Pemasukan (+)" : "Pengeluaran (-)"}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-weight: 700; text-align: right; color: ${isIncome ? "#059669" : "#E11D48"};">
            ${isIncome ? "+ " : "- "} ${formatRupiah(tx.amount)}
          </td>
        </tr>
      `;
    }).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>Laporan Keuangan FINORA - ${periodLabel}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 16mm 14mm 16mm 14mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          body {
            margin: 0;
            padding: 24px;
            color: #0F172A;
            background: #FFFFFF;
            font-size: 13px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 2px solid #0D9488;
            margin-bottom: 24px;
          }
          .brand-logo {
            font-size: 26px;
            font-weight: 800;
            color: #0F766E;
            letter-spacing: -0.5px;
          }
          .brand-logo span {
            color: #0D9488;
          }
          .brand-tagline {
            font-size: 11px;
            color: #64748B;
            font-weight: 500;
            margin-top: 2px;
          }
          .doc-info {
            text-align: right;
          }
          .doc-title {
            font-size: 16px;
            font-weight: 800;
            color: #0F172A;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .doc-meta {
            font-size: 11px;
            color: #64748B;
            margin-top: 4px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
          }
          .meta-item-title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: #64748B;
            margin-bottom: 3px;
          }
          .meta-item-value {
            font-size: 13px;
            font-weight: 700;
            color: #0F172A;
          }
          .summary-cards {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
          }
          .sum-card {
            padding: 14px 16px;
            border-radius: 10px;
            border: 1px solid #E2E8F0;
          }
          .sum-card.income { background-color: #F0FDF4; border-color: #BBF7D0; }
          .sum-card.expense { background-color: #FFF1F2; border-color: #FECDD3; }
          .sum-card.net { background-color: #F0FDFA; border-color: #99F6E4; }
          .sum-label { font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
          .sum-card.income .sum-label { color: #166534; }
          .sum-card.expense .sum-label { color: #9F1239; }
          .sum-card.net .sum-label { color: #115E59; }
          .sum-amount { font-size: 18px; font-weight: 800; }
          .sum-card.income .sum-amount { color: #15803D; }
          .sum-card.expense .sum-amount { color: #BE123C; }
          .sum-card.net .sum-amount { color: #0F766E; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 24px;
          }
          th {
            background-color: #0F766E;
            color: #FFFFFF;
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
          }
          th.right, td.right { text-align: right; }
          th.center, td.center { text-align: center; }
          .footer-total {
            background: #F8FAFC;
            border-top: 2px solid #0F766E;
            font-weight: 700;
          }
          .notes-box {
            margin-top: 30px;
            padding: 14px 18px;
            border-radius: 8px;
            background: #F8FAFC;
            border-left: 4px solid #0D9488;
            font-size: 11px;
            color: #475569;
          }
          .print-btn-bar {
            margin-bottom: 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          .btn-print {
            padding: 8px 18px;
            background: #0D9488;
            color: #FFFFFF;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          }
          @media print {
            .print-btn-bar { display: none !important; }
            body { padding: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-bar">
          <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="brand-logo">FIN<span>ORA</span></div>
            <div class="brand-tagline">Sistem Manajemen & Pembukuan Keuangan Digital</div>
          </div>
          <div class="doc-info">
            <div class="doc-title">Laporan Keuangan & Mutasi</div>
            <div class="doc-meta">No. Dokumen: <strong>${reportNo}</strong></div>
            <div class="doc-meta">Tanggal Cetak: ${printDate}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <div class="meta-item-title">Pemilik Akun</div>
            <div class="meta-item-value">${user?.name || "Pengguna"}</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${user?.email || "Dulure Ultramen"}</div>
          </div>
          <div>
            <div class="meta-item-title">Periode Laporan</div>
            <div class="meta-item-value">${periodLabel}</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Status Filter: ${typeFilter === "all" ? "Semua Transaksi" : typeFilter === "income" ? "Pemasukan Saja" : "Pengeluaran Saja"}</div>
          </div>
        </div>

        <div class="summary-cards">
          <div class="sum-card income">
            <div class="sum-label">Total Pemasukan</div>
            <div class="sum-amount">${formatRupiah(summary.income)}</div>
          </div>
          <div class="sum-card expense">
            <div class="sum-label">Total Pengeluaran</div>
            <div class="sum-amount">${formatRupiah(summary.expense)}</div>
          </div>
          <div class="sum-card net">
            <div class="sum-label">Arus Kas Bersih (Surplus)</div>
            <div class="sum-amount">${formatRupiah(summary.net)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="center" style="width: 36px;">No</th>
              <th style="width: 100px;">Tanggal</th>
              <th>Deskripsi / Transaksi</th>
              <th>Kategori</th>
              <th>Metode</th>
              <th class="center" style="width: 110px;">Jenis</th>
              <th class="right" style="width: 130px;">Nominal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="7" style="padding: 24px; text-align: center; color: #64748B;">Tidak ada transaksi dalam periode ini.</td></tr>`}
          </tbody>
          <tfoot>
            <tr class="footer-total">
              <td colspan="6" style="padding: 12px; text-align: right; font-size: 12px;">Total Arus Kas Bersih Periode Ini:</td>
              <td class="right" style="padding: 12px; font-size: 13px; color: #0F766E;">${formatRupiah(summary.net)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="notes-box">
          <strong>Catatan & Keabsahan Sistem:</strong><br />
          Laporan ini dibuat dan digenerate secara resmi melalui platform FINORA Cloud. Seluruh data transaksi di atas dicatat secara otomatis dan diverifikasi langsung dari akun Anda.
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ==========================================
  // GENERATOR UNDUH EXCEL / CSV
  // ==========================================
  const handleDownloadCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada transaksi untuk diekspor pada periode ini.");
      return;
    }

    const headers = [
      "No",
      "Tanggal",
      "Judul Transaksi",
      "Kategori",
      "Tipe",
      "Metode Pembayaran",
      "Nominal (Rp)",
      "Catatan",
    ];

    const rows = filteredTransactions.map((tx, idx) => [
      idx + 1,
      `"${tx.date}"`,
      `"${(tx.title || "").replace(/"/g, '""')}"`,
      `"${(tx.category || "").replace(/"/g, '""')}"`,
      tx.type === "income" ? "Pemasukan" : "Pengeluaran",
      `"${(tx.paymentMethod || "Transfer").replace(/"/g, '""')}"`,
      Number(tx.amount || 0),
      `"${(tx.note || "").replace(/"/g, '""')}"`,
    ]);

    // CSV format with UTF-8 BOM
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const cleanPeriod = periodLabel.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Keuangan_Finora_${cleanPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0B1522] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display">
                Unduh Laporan Keuangan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih periode dan format laporan yang ingin Anda unduh atau cetak.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Pilihan Periode Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Pilih Rentang Periode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "hari_ini", label: "Hari Ini" },
                { id: "bulan_ini", label: "Bulan Ini" },
                { id: "pilih_bulan", label: "Pilih Bulan" },
                { id: "4_bulan", label: "4 Bulan" },
                { id: "custom", label: "Kustom Tanggal" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeframe(tab.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all text-center ${
                    timeframe === tab.id
                      ? "bg-teal-500 text-white shadow-md shadow-teal-500/25 scale-[1.02]"
                      : "bg-slate-100 dark:bg-[#0F1D30] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Inputs for 'pilih_bulan' & 'custom' */}
          {timeframe === "pilih_bulan" && (
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-500/20 space-y-2 animate-fadeIn">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Pilih Bulan Laporan:
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#071322] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          )}

          {timeframe === "custom" && (
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Dari Tanggal:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#071322] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#071322] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          )}

          {/* Filter Jenis Transaksi */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Jenis Transaksi:
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#071322] border border-slate-200 dark:border-white/5">
              {[
                { id: "all", label: "Semua" },
                { id: "income", label: "Pemasukan" },
                { id: "expense", label: "Pengeluaran" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setTypeFilter(btn.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    typeFilter === btn.id
                      ? "bg-white dark:bg-[#0F1D30] text-teal-600 dark:text-teal-400 shadow-2xs font-bold"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#071322] border border-slate-200/80 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                {periodLabel}
              </span>
              <span>{summary.count} transaksi ditemukan</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                  Pemasukan
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300 font-display mt-0.5 truncate">
                  {formatRupiah(summary.income)}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20">
                <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 block">
                  Pengeluaran
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-rose-700 dark:text-rose-300 font-display mt-0.5 truncate">
                  {formatRupiah(summary.expense)}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-500/20">
                <span className="text-[10px] font-bold uppercase text-teal-700 dark:text-teal-400 block">
                  Arus Kas Bersih
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-teal-800 dark:text-teal-200 font-display mt-0.5 truncate">
                  {formatRupiah(summary.net)}
                </p>
              </div>
            </div>
          </div>

          {/* Mini Table Preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Pratinjau Data yang Akan Masuk Laporan ({filteredTransactions.length} baris):
            </span>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/5 divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#071322]">
              {filteredTransactions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Tidak ada transaksi yang cocok pada periode ini.
                </div>
              ) : (
                filteredTransactions.slice(0, 10).map((t) => (
                  <div key={t.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-[10px] text-slate-400 w-16 shrink-0">{t.date}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{t.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500">{t.category}</span>
                    </div>
                    <span className={`font-bold shrink-0 ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {t.type === "income" ? "+" : "-"} {formatRupiah(t.amount)}
                    </span>
                  </div>
                ))
              )}
              {filteredTransactions.length > 10 && (
                <div className="p-2 text-center text-[11px] text-slate-400 bg-slate-50 dark:bg-white/[0.01]">
                  + {filteredTransactions.length - 10} transaksi lainnya akan disertakan dalam dokumen lengkap.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsReportModalOpen(false)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all text-center"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={filteredTransactions.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0F1D30] hover:bg-slate-100 dark:hover:bg-[#16273d] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs disabled:opacity-50 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Unduh Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={filteredTransactions.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Printer className="w-4 h-4 stroke-[2.2]" />
            <span>Unduh PDF Resmi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
