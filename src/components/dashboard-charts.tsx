"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

type DashboardChartsProps = {
  claimData: number[];
  claimLabels: string[];
  claimTitle: string;
  claimDetail: string;
  trendData: number[];
  trendLabels: string[];
  trendTitle: string;
  trendDetail: string;
};

export function DashboardCharts(props: DashboardChartsProps) {
  const trendCanvas = useRef<HTMLCanvasElement>(null);
  const claimCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trendCanvas.current || !claimCanvas.current) return;
    const trendChart = new Chart(trendCanvas.current, {
      type: "line",
      data: {
        labels: props.trendLabels,
        datasets: [{
          data: props.trendData,
          borderColor: "#059669",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#047857",
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
    const claimChart = new Chart(claimCanvas.current, {
      type: "doughnut",
      data: {
        labels: props.claimLabels,
        datasets: [{
          data: props.claimData,
          backgroundColor: ["#059669", "#2563eb", "#f59e0b", "#94a3b8"],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true } } },
      },
    });
    return () => {
      trendChart.destroy();
      claimChart.destroy();
    };
  }, [props]);

  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{props.trendTitle}</p>
        <p className="mt-1 text-sm text-slate-500">{props.trendDetail}</p>
        <div className="mt-5 h-64"><canvas ref={trendCanvas} /></div>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{props.claimTitle}</p>
        <p className="mt-1 text-sm text-slate-500">{props.claimDetail}</p>
        <div className="mt-5 h-64"><canvas ref={claimCanvas} /></div>
      </article>
    </section>
  );
}
