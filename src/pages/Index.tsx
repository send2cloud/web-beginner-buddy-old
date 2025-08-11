import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Hello World";
    const description = "Simple Hello World page built with React and Tailwind.";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);

    const canonical = document.querySelector('link[rel="canonical"]');
    const href = window.location.href;
    if (canonical) {
      canonical.setAttribute("href", href);
    } else {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      link.setAttribute("href", href);
      document.head.appendChild(link);
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Hello World</h1>
        <p className="text-lg text-muted-foreground">
          A minimal page rendered with React + Vite.
        </p>
      </section>
    </main>
  );
};

export default Index;
