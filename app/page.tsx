export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center max-w-md space-y-3">
        <h1 className="text-2xl font-bold text-gray-800">Event Submission Form</h1>
        <p className="text-gray-500 text-sm">
          This form is designed to be embedded on a customer&apos;s website.
        </p>
        <p className="text-gray-400 text-xs font-mono bg-gray-100 rounded p-2">
          /embed?customer=&#123;customer_uuid&#125;
        </p>
      </div>
    </div>
  );
}
