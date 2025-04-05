import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-white mb-3">About Sensei</h3>
            <p className="text-gray-400">
              Empowering careers through AI-driven interview preparation and career assistance.
            </p>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-white mb-3">Quick Links</h3>
            <ul className="flex justify-center space-x-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-blue-400 transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          © {new Date().getFullYear()} Sensi. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
