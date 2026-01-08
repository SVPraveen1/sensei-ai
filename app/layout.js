import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] }); //font family

export const metadata = {
  title: "Sensai - AI-Powered Career Growth Platform",
  description:
    "Accelerate your career with AI-powered industry insights, interview preparation, resume building, and cover letter generation. Get personalized guidance tailored to your industry and skills.",
  keywords: [
    "AI career coach",
    "interview preparation",
    "resume builder",
    "cover letter generator",
    "industry insights",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} `}>
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme="dark"
            disableTransitionOnChange
          >
            {/*header*/}
            <Header />
            <main className="min-h-screen">{children}</main>
            {/*footer*/}
            {/* <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-gray-200 text-center">
                <p>This is footer component</p>
              </div>
            </footer> */}
            <Footer />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
