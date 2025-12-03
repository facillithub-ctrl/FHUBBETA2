export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {children}
    </div>
  );
}