import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const features = [
    {
      title: "บันทึกความล้มเหลว",
      desc: "จดสิ่งที่พลาดในแต่ละวัน พร้อมรายละเอียด สาเหตุ และบทเรียนที่ได้",
      icon: "📝",
    },
    {
      title: "AI Suggestion",
      desc: "ให้ AI ช่วยวิเคราะห์ความผิดพลาดและเสนอแนวทางปรับปรุงที่นำไปใช้ได้จริง",
      icon: "🤖",
    },
    {
      title: "เติบโตจากทุกครั้งที่พลาด",
      desc: "เปลี่ยนความล้มเหลวให้กลายเป็นระบบพัฒนาตัวเองแบบต่อเนื่อง",
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
                เปลี่ยนความล้มเหลวให้เป็นการเรียนรู้
              </div>

              <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                บันทึกทุก<span className="text-orange-700">ความผิดพลาด</span>
                <span className="block text-slate-700">แล้วเติบโตจากมัน</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Failio คือเว็บสำหรับบันทึกความล้มเหลว วิเคราะห์สาเหตุ และใช้ AI ช่วยแนะนำแนวทางแก้ไข
                เพื่อให้ทุกครั้งที่พลาด กลายเป็นบทเรียนที่พัฒนาคุณได้จริง
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href='/dashboard' className="rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-slate-800">
                  เริ่มบันทึกเลย
                </Link>
              </div>
            </div>

            {/* Right Card */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-4xl bg-orange-200/40 blur-3xl" />
              <div className="relative rounded-4xl border border-slate-200 bg-white/90 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-500">ตัวอย่างการบันทึก</p>
                    <p className="font-semibold text-slate-800">อ่านหนังสือไม่ทันก่อนสอบ</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Demo
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">เกิดอะไรขึ้น?</p>
                    <p className="mt-2 text-sm text-slate-700">
                      ผัดวันประกันพรุ่งและประเมินเนื้อหาที่ต้องอ่านน้อยเกินไป ทำให้เตรียมตัวไม่ทันและกดดันมากขึ้น
                    </p>
                  </div>

                  <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm font-medium text-orange-700">AI Suggestion</p>
                    <p className="mt-2 text-sm text-slate-700">
                      แบ่งเนื้อหาเป็นงานย่อยรายวัน ตั้ง deadline ล่วงหน้ากว่าจริง และเช็กความคืบหน้าทุกคืน
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">สาเหตุหลัก</p>
                      <p className="mt-2 font-medium text-slate-800">วางแผนเวลาไม่ดี</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">บทเรียนที่ได้</p>
                      <p className="mt-2 font-medium text-slate-800">เริ่มเร็ว ทบทวนทุกวัน</p>
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
            เครื่องมือที่ช่วยให้ความล้มเหลวมีความหมาย
          </h2>
          <p className="mt-4 text-slate-600">
            ไม่ใช่แค่จดว่าเกิดอะไรขึ้น แต่ช่วยให้คุณเข้าใจสาเหตุและเปลี่ยนมันเป็นการพัฒนาจริง
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
                อย่าปล่อยให้ความล้มเหลวหายไป
                <span className="block">เปลี่ยนมันให้เป็นบทเรียน</span>
              </h2>
              <p className="mt-4 max-w-xl text-slate-600">
                Failio ช่วยให้คุณเก็บทุกบทเรียนไว้ในที่เดียว และค่อย ๆ พัฒนาตัวเองแบบมีหลักฐาน ไม่ใช่แค่ความรู้สึก
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link href='/sign-up' className="rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800">
                สมัครใช้งาน
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
