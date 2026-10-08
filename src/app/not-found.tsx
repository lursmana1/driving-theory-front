import "@/app/globals.css";
import NotFoundView from "@/components/NotFoundPage/NotFoundView";

export default function NotFound() {
  return (
    <html lang="ka">
      <head>
        <title>ეს გვერდი არ არსებობს</title>
      </head>
      <body className="bg-paper text-ink antialiased">
        <NotFoundView title="ეს გვერდი არ არსებობს" backLabel="უკან დაბრუნება" />
      </body>
    </html>
  );
}
