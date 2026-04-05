import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const features = [
    {
      title: "Log Your Failures",
      desc: "Record daily mistakes with details, causes, and lessons learned.",
      icon: "📝",
    },
    {
      title: "AI Suggestion",
      desc: "Let AI analyze failures and suggest practical improvement steps.",
      icon: "🤖",
    },
    {
      title: "Grow From Mistakes",
      desc: "Turn every failure into a continuous self-improvement system.",
      icon: "📈",
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-b from-white via-slate-50 to-orange-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_30%),radial-gradient(circle_at_left,rgba(30,41,59,0.06),transparent_20%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-10 sm:py-14 lg:py-20">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/logo-nav.png"
              alt="Failio Logo"
              width={340}
              height={120}
              className="h-auto w-55 sm:w-70 lg:w-85"
              priority
            />
          </div>

          <div className="mt-4 grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
                <span>✨</span>
                Turn failure into learning
              </div>

              <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Record Every <span className="text-orange-700">Mistake</span>
                <span className="block text-slate-700">and Grow From It</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Failio is a platform to record failures, analyze causes, and use AI suggestions to ensure every mistake becomes a growth milestone.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href='/dashboard' className="rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-slate-800">
                  Start Logging Now
                </Link>
              </div>
            </div>

            {/* Right Card */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-4xl bg-orange-200/40 blur-3xl" />
              <div className="relative rounded-4xl border border-slate-200 bg-white/90 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-500">Example Entry</p>
                    <p className="font-semibold text-slate-800">Failed to finish reading before exam</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Demo
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">What happened?</p>
                    <p className="mt-2 text-sm text-slate-700">
                      Procrastinated and underestimated the material, leading to last-minute pressure and stress.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm font-medium text-orange-700">AI Suggestion</p>
                    <p className="mt-2 text-sm text-slate-700">
                      Break content into small daily tasks, set earlier internal deadlines, and review progress nightly.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Root Cause</p>
                      <p className="mt-2 font-medium text-slate-800">Poor time management</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Lesson Learned</p>
                      <p className="mt-2 font-medium text-slate-800">Start early, review daily</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Features</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Tools that make failure meaningful
          </h2>
          <p className="mt-4 text-slate-600">
            Not just recording what happened, but helping you understand the cause and turn it into real growth.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-4xl border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-100 text-2xl ring-1 ring-orange-200">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2.5rem] border border-orange-200 bg-linear-to-r from-orange-50 to-white p-8 shadow-xl sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Start now</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Don&apos;t let failures go to waste.
                <span className="block">Turn them into lessons.</span>
              </h2>
              <p className="mt-4 max-w-xl text-slate-600">
                Failio helps you store every lesson in one place and develop yourself based on evidence, not just feelings.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link href='/sign-up' className="rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
