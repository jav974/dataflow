import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <img
            src="/background.png"
            alt="Graph background"
            className="object-cover w-full h-full opacity-30"
          />
        </div>
        <div className="z-10 max-w-2xl">
          <h1 className="text-5xl font-bold mb-4">Dataflow</h1>
          <p className="text-xl mb-8">Visual logic that executes. Realtime, reactive, and low-code.</p>
          <div className="space-x-4">
            <Link href="/editor" className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded">
              Try the Demo
            </Link>
            <Link href="/login" className="text-gray-300 hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-800 text-center">
        <h2 className="text-3xl font-bold mb-8">What makes Dataflow different?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
          <Feature title="Reactive Graph Execution" description="Run your graphs in realtime with feedback as you go." />
          <Feature title="Ultra-fast UI" description="Powered by react-refsignal—instant updates, no jank." />
          <Feature title="Custom Logic Blocks" description="Design nodes with your own logic and data types." />
          <Feature title="Remote Execution Support" description="Execute graphs locally or on a cloud worker." />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}