
// instrumentation.ts
// เพื่อให้ AI Worker ทำงาน
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initAIWorker } = await import('./lib/ai-analysis/queue');
    console.log('[Instrumentation] Initializing AI Worker...');
    initAIWorker();
  }
}
