"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;
const VIDEO_DURATION = 20; // seconds

type TimelineMessage = {
  start: number;
  end: number;
  title: string;
  description: string;
};

const TIMELINE: TimelineMessage[] = [
  {
    start: 0,
    end: 4,
    title: "Antech O&M",
    description:
      "Operação & manutenção completa para usinas solares de grande porte.",
  },
  {
    start: 4,
    end: 9,
    title: "Lavagem técnica",
    description:
      "Processos controlados que removem poeira, fuligem e resíduos sem agredir os módulos.",
  },
  {
    start: 9,
    end: 14,
    title: "Roçagem estratégica",
    description:
      "Controle de vegetação permanente, preservando cabos e acessos operacionais.",
  },
  {
    start: 14,
    end: 20,
    title: "Performance garantida",
    description:
      "Equipe especializada, relatórios rápidos e disponibilidade 24/7.",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const fadeBetween = (time: number, start: number, end: number) => {
  const length = end - start;
  if (length <= 0) return 0;
  const local = clamp((time - start) / length, 0, 1);
  const fadeWindow = 0.8;
  const fadeIn = clamp(local / fadeWindow, 0, 1);
  const fadeOut = clamp((1 - local) / fadeWindow, 0, 1);
  return easeInOutCubic(Math.min(fadeIn, fadeOut));
};

const backgroundGradient = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
) => {
  const shift = Math.sin(t * 0.5) * 0.2;
  const gradient = ctx.createLinearGradient(
    width * shift,
    height,
    width,
    0,
  );
  gradient.addColorStop(0, "#02111d");
  gradient.addColorStop(0.35, "#022c43");
  gradient.addColorStop(0.7, "#073f5b");
  gradient.addColorStop(1, "#2d6a4f");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

const drawSolarPanels = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
) => {
  const baseY = height * 0.68;
  const panelCount = 6;

  for (let i = 0; i < panelCount; i++) {
    const panelWidth = 160;
    const panelHeight = 90;
    const spacing = panelWidth + 40;
    const startX = width * 0.2 + i * spacing;
    const tilt = -0.45 + i * 0.03;

    ctx.save();
    ctx.translate(startX, baseY + Math.sin(t * 1.5 + i) * 6);
    ctx.rotate(tilt);

    ctx.fillStyle = "rgba(14, 76, 114, 0.85)";
    ctx.strokeStyle = "rgba(180, 225, 250, 0.25)";
    ctx.lineWidth = 2;
    drawRoundedRect(
      ctx,
      -panelWidth / 2,
      -panelHeight,
      panelWidth,
      panelHeight,
      10,
    );
    ctx.fill();
    ctx.stroke();

    const cellRows = 3;
    const cellCols = 4;
    const cellPadding = 8;
    const cellWidth =
      (panelWidth - cellPadding * (cellCols + 1)) / cellCols;
    const cellHeight =
      (panelHeight - cellPadding * (cellRows + 1)) / cellRows;

    for (let row = 0; row < cellRows; row++) {
      for (let col = 0; col < cellCols; col++) {
        const cellX =
          -panelWidth / 2 + cellPadding + col * (cellWidth + cellPadding);
        const cellY =
          -panelHeight + cellPadding + row * (cellHeight + cellPadding);
        const glow =
          Math.sin(t * 2 + i * 0.5 + row * 0.8 + col * 0.3) * 0.25 + 0.35;

        ctx.fillStyle = `rgba(${Math.round(40 + glow * 80)}, ${Math.round(
          120 + glow * 90,
        )}, ${Math.round(180 + glow * 40)}, 0.92)`;
        ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
      }
    }

    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = "rgba(240, 255, 255, 0.12)";
  ctx.translate(width * 0.65, baseY - 180);
  ctx.rotate(-0.35);
  const pulse = Math.sin(t * 1.2) * 0.5 + 0.5;
  ctx.fillRect(-160, -60 * (0.9 + pulse * 0.2), 320, 120 * (0.9 + pulse * 0.2));
  ctx.restore();
};

const drawHighlights = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
) => {
  const orbitRadius = width * 0.38;
  const centerX = width * 0.5;
  const centerY = height * 0.38;
  const orbCount = 5;

  for (let i = 0; i < orbCount; i++) {
    const angle = t * 0.5 + (i / orbCount) * Math.PI * 2;
    const size = 14 + Math.sin(t * 1.3 + i) * 5;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 190, 92, ${0.12 + (i / orbCount) * 0.35})`;
    ctx.arc(
      centerX + Math.cos(angle) * orbitRadius,
      centerY + Math.sin(angle) * (orbitRadius * 0.6),
      size,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word, index) => {
    const testLine = `${line}${word} `;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && index !== 0) {
      ctx.fillText(line.trimEnd(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line) {
    ctx.fillText(line.trimEnd(), x, currentY);
  }
};

const drawTimelineMessage = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
) => {
  const current =
    TIMELINE.find((item) => t >= item.start && t < item.end) ??
    TIMELINE[TIMELINE.length - 1];
  const alpha = fadeBetween(t, current.start, current.end);

  ctx.save();
  ctx.translate(width * 0.12, height * 0.22);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.font = "700 54px 'Inter', 'Helvetica Neue', sans-serif";
  ctx.fillText(current.title, 0, 0);
  ctx.font = "400 26px 'Inter', 'Helvetica Neue', sans-serif";
  wrapText(ctx, current.description, 0, 56, width * 0.5, 34);
  ctx.restore();
};

const drawMetricsBar = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
) => {
  const barY = height * 0.85;
  const barWidth = width * 0.76;
  const barHeight = 48;
  ctx.save();
  ctx.translate(width * 0.12, barY);

  ctx.fillStyle = "rgba(3, 24, 43, 0.82)";
  ctx.fillRect(0, 0, barWidth, barHeight);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, barWidth, barHeight);

  const metrics = [
    {
      label: "Geração otimizada",
      value: 18 + Math.sin(t * 0.6) * 2,
      suffix: "%",
    },
    {
      label: "Cobertura programada",
      value: 365,
      suffix: " dias",
    },
    {
      label: "Resposta emergencial",
      value: 4 + Math.sin(t * 0.9) * 0.8,
      suffix: "h",
    },
  ];

  metrics.forEach((metric, index) => {
    const columnWidth = barWidth / metrics.length;
    const columnX = index * columnWidth;

    ctx.fillStyle = "rgba(21, 161, 118, 0.28)";
    const progressWidth =
      (columnWidth - 24) * clamp(metric.value / 40, 0.12, 1);
    ctx.fillRect(columnX + 12, 12, progressWidth, barHeight - 24);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "700 18px 'Inter', sans-serif";
    ctx.fillText(
      `${metric.value.toFixed(metric.suffix === "%" ? 1 : 0)}${
        metric.suffix
      }`,
      columnX + 12,
      22,
    );

    ctx.font = "500 12px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(200, 224, 255, 0.8)";
    wrapText(ctx, metric.label, columnX + 12, 38, columnWidth - 24, 14);
  });

  ctx.restore();
};

const renderFrame = (canvas: HTMLCanvasElement, t: number) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  backgroundGradient(ctx, canvas.width, canvas.height, t);
  drawHighlights(ctx, canvas.width, canvas.height, t);
  drawSolarPanels(ctx, canvas.width, canvas.height, t);
  drawTimelineMessage(ctx, canvas.width, canvas.height, t);
  drawMetricsBar(ctx, canvas.width, canvas.height, t);
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const stopPlayback = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = null;
    setIsPlaying(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (!isPlaying) {
      renderFrame(canvas, clamp(currentTime, 0, VIDEO_DURATION));
      return;
    }

    let start = 0;

    const draw = (timestamp: number) => {
      if (!canvasRef.current) return;
      if (!start) {
        start = timestamp - currentTime * 1000;
      }
      const elapsed = (timestamp - start) / 1000;
      const clamped = clamp(elapsed, 0, VIDEO_DURATION);
      renderFrame(canvasRef.current, clamped);
      setCurrentTime(clamped);

      if (clamped >= VIDEO_DURATION) {
        stopPlayback();
        if (isRecording) {
          stopRecording();
        }
        setCurrentTime(VIDEO_DURATION);
        return;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderFrame(canvas, clamp(currentTime, 0, VIDEO_DURATION));
  }, [currentTime]);

  useEffect(
    () => () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    },
    [downloadUrl],
  );

  const handlePlay = () => {
    if (isRecording) return;
    if (!canvasRef.current) return;
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleRecord = () => {
    if (isRecording) return;
    if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
      setStatusMessage("Recurso de gravação não suportado neste navegador.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!canvas.captureStream) {
      setStatusMessage("Captura de vídeo indisponível neste dispositivo.");
      return;
    }

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 8_000_000,
    });

    chunksRef.current = [];
    recorderRef.current = recorder;
    setIsRecording(true);
    setStatusMessage("Gerando vídeo promocional…");

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsRecording(false);
      setStatusMessage("Vídeo pronto! Faça o download abaixo.");
      chunksRef.current = [];
    };

    recorder.start();
    setCurrentTime(0);
    setIsPlaying(true);

    recordingTimeoutRef.current = setTimeout(() => {
      stopRecording();
    }, (VIDEO_DURATION + 0.5) * 1000);
  };

  const handleReset = () => {
    stopPlayback();
    if (isRecording) {
      stopRecording();
    }
    setCurrentTime(0);
    setStatusMessage("");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    const canvas = canvasRef.current;
    if (canvas) {
      renderFrame(canvas, 0);
    }
  };

  const progress = (currentTime / VIDEO_DURATION) * 100;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <header className="flex flex-col gap-6 pb-12">
          <span className="w-fit rounded-full border border-emerald-400/50 bg-emerald-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-emerald-300">
            Antech O&M • Energia em alta performance
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
            Vídeo comercial para lavagem e roçagem de usinas solares
          </h1>
          <p className="max-w-3xl text-lg text-slate-300 md:text-xl">
            Produção automática de um vídeo promocional dinâmico destacando o
            cuidado especializado da Antech O&amp;M em operação e manutenção de
            usinas solares: lavagem técnica, roçagem e performance garantida.
          </p>
        </header>

        <section className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-[0_30px_80px_rgba(5,10,30,0.48)]">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4">
              <canvas
                ref={canvasRef}
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                className="aspect-video w-full rounded-xl bg-black"
              />
              <div className="pointer-events-none absolute inset-4 rounded-xl border border-white/5" />
            </div>
            <div>
              <div className="mb-4 flex items-center gap-3 text-sm text-slate-400">
                <div className="h-1 flex-1 rounded-full bg-slate-800">
                  <span
                    style={{ width: `${progress}%` }}
                    className="block h-full rounded-full bg-emerald-400 transition-all duration-200"
                  />
                </div>
                <span>
                  {currentTime.toFixed(1)}s / {VIDEO_DURATION}s
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePlay}
                  disabled={isPlaying || isRecording}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-700/40 disabled:text-slate-300"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M4 3.5v13a.5.5 0 0 0 .78.41l10-6.5a.5.5 0 0 0 0-.82l-10-6.5A.5.5 0 0 0 4 3.5Z" />
                  </svg>
                  Reproduzir vídeo
                </button>
                <button
                  onClick={handleRecord}
                  disabled={isRecording}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-transparent px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-300 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-emerald-700/40 disabled:text-emerald-700/70"
                >
                  <span className="relative flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500">
                    <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/60" />
                  </span>
                  Gravar &amp; baixar
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-slate-400 transition hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  >
                    <path
                      d="M3 12a9 9 0 0 1 15.54-5.64L21 9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12a9 9 0 0 1-15.54 5.64L3 15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Reiniciar
                </button>
              </div>
              {statusMessage && (
                <p className="mt-4 text-sm text-emerald-200">{statusMessage}</p>
              )}
              {downloadUrl && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  <span>Vídeo comercial (WebM • 720p)</span>
                  <a
                    href={downloadUrl}
                    download="antech-om-video.webm"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-200"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2a.75.75 0 0 1 .75.75v7.69l2.22-2.22a.75.75 0 0 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V2.75A.75.75 0 0 1 10 2Z" />
                      <path d="M3.5 11.5a.75.75 0 0 1 .75.75v2a1 1 0 0 0 1 1h9.5a1 1 0 0 0 1-1v-2a.75.75 0 0 1 1.5 0v2a2.5 2.5 0 0 1-2.5 2.5h-9.5A2.5 2.5 0 0 1 3 14.25v-2a.75.75 0 0 1 .75-.75Z" />
                    </svg>
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Mensagem-chave do roteiro
              </h2>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span>
                    Abertura com destaque da marca, reforçando presença nacional e confiança.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span>
                    Lavagem técnica mostrando painéis vibrantes e limpeza profunda sem danos.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span>
                    Roçagem estratégica ilustrada pela equipe em campo e controle da vegetação.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span>
                    Encerramento com CTA claro: disponibilidade total, tecnologia e performance.
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/5 p-6">
              <h3 className="text-lg font-semibold text-emerald-200">
                Dicas para acrescentar imagens reais
              </h3>
              <p className="mt-3 text-sm text-slate-300">
                Intercale takes reais de lavagem e roçagem, drones sobrevoando a usina, closes nos módulos limpos e depoimentos curtos dos técnicos. Na trilha sonora, priorize beats eletrônicos energizantes com transições suaves.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-16 grid gap-10 rounded-3xl border border-white/10 bg-slate-900/40 p-10 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white">
              Porque clientes escolhem a Antech O&amp;M
            </h2>
            <p className="text-slate-300">
              Unimos engenharia, tecnologia e equipes em campo para garantir disponibilidade máxima da sua usina fotovoltaica. Nosso time acompanha indicadores em tempo real e atua proativamente para evitar perdas de geração.
            </p>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  1
                </span>
                Plano de lavagem modular com monitoramento de eficiência pós-serviço.
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  2
                </span>
                Roçagem contínua e rondas preventivas para acesso seguro aos painéis.
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  3
                </span>
                Relatórios inteligentes entregues em até 24 horas com fotos e insights.
              </li>
            </ul>
          </div>
          <div className="grid gap-6 rounded-2xl border border-white/5 bg-slate-950/60 p-8">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Roteiro sugerido (20s)
              </h3>
              <ol className="mt-4 space-y-4 text-sm text-slate-300">
                <li>
                  <span className="font-semibold text-emerald-300">
                    0s - 4s:
                  </span>{" "}
                  Logo flutuando sobre painéis ao amanhecer e chamada institucional.
                </li>
                <li>
                  <span className="font-semibold text-emerald-300">
                    4s - 9s:
                  </span>{" "}
                  Destaque para lavagem técnica com closes em água pura e brilho dos módulos.
                </li>
                <li>
                  <span className="font-semibold text-emerald-300">
                    9s - 14s:
                  </span>{" "}
                  Roçagem com equipe em campo, tratores leves e proteção dos cabos elétricos.
                </li>
                <li>
                  <span className="font-semibold text-emerald-300">
                    14s - 20s:
                  </span>{" "}
                  Painéis reluzentes, dashboards de monitoramento e CTA para contato imediato.
                </li>
              </ol>
            </div>
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-sm text-emerald-100">
              <p>
                Use este vídeo gerado como base visual, inserindo locução profissional e imagens reais para fortalecer a autenticidade e impacto comercial em redes sociais, apresentações ou telas internas.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 rounded-3xl border border-white/10 bg-slate-900/50 p-10 text-sm text-slate-300 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Contato rápido</h3>
            <p className="mt-3">
              atendimento@antechom.com.br
              <br />
              +55 (11) 4000-2024
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Cobertura</h3>
            <p className="mt-3">
              Operações em todo o Brasil com bases em SP, MG e BA. Atendimento urgente em até 48h.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Certificações</h3>
            <p className="mt-3">
              ISO 9001 • NR-10 • NR-35 • Equipes treinadas em ambientes energizados e gestão ambiental.
            </p>
          </div>
        </section>

        <footer className="mt-14 flex flex-col gap-4 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-8 text-center text-sm text-emerald-100 md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <h3 className="text-2xl font-semibold text-emerald-200">
              Pronto para elevar sua geração?
            </h3>
            <p className="mt-2">
              Agende uma inspeção gratuita e receba um plano integrado de lavagem e roçagem com ROI estimado.
            </p>
          </div>
          <a
            href="mailto:comercial@antechom.com.br"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-300 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-200"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1.45.89l-6.55-3.27a1 1 0 0 0-.9 0L5.55 19.89A1 1 0 0 1 4 19V5a1 1 0 0 1 1-1Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m5 5 7 7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Falar com especialista
          </a>
        </footer>
      </div>
    </main>
  );
}
