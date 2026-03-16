export default function FormSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Logo / header card */}
        <div className="bg-white rounded-2xl border border-gray-100 py-8 flex flex-col items-center gap-3">
          <div className="h-16 w-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse mt-1" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Event Details */}
        <Card>
          <SectionLabel />
          <Field wide />
          <Field wide tall />
          <div className="grid grid-cols-2 gap-4">
            <Field />
            <Field />
          </div>
          <Field />
          <Field />
        </Card>

        {/* Location */}
        <Card>
          <SectionLabel />
          <Field />
          <Field />
          <Field />
        </Card>

        {/* Pricing */}
        <Card>
          <SectionLabel />
          <div className="flex gap-4">
            <Field />
            <div className="w-28 h-10 bg-gray-100 rounded-xl animate-pulse mt-6 flex-shrink-0" />
          </div>
        </Card>

        {/* Your Info */}
        <Card>
          <SectionLabel />
          <Field wide />
          <Field wide />
        </Card>

        {/* Images */}
        <Card>
          <SectionLabel />
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        </Card>

        {/* Submit button */}
        <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />

      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      {children}
    </div>
  );
}

function SectionLabel() {
  return <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />;
}

function Field({ wide, tall }: { wide?: boolean; tall?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
      <div className={`bg-gray-100 rounded-xl animate-pulse ${tall ? "h-24" : "h-11"} ${wide ? "w-full" : "w-full"}`} />
    </div>
  );
}
