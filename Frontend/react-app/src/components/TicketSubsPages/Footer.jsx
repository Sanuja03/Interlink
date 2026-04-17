import logo from "../../assets/footer/logo.png";
import facebook from "../../assets/footer/facebook.png";
import instagram from "../../assets/footer/instagram.png";
import whatsapp from "../../assets/footer/whatsapp.png";
import linkedin from "../../assets/footer/linkedin.png";

export default function Footer() {
  return (
    <footer className="bg-[#0C3E56] text-white/85 py-6">
      <div className="max-w-[1150px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Address */}
        <div>
          <p className="text-[14px] leading-[20px]">
            University of Moratuwa, Bandaranayake Mawatha
            <br />
            Moratuwa, Sri Lanka
            <br />
            Tel: +94 112 388 655
            <br />
            Email: info@interlink.com
          </p>
        </div>

        {/* Job Seekers */}
        <div>
          <h4 className="text-white text-[16px] font-semibold mb-2">
            Job Seekers
          </h4>
          <ul className="space-y-1 text-[14px]">
            <li>
              <a href="#" className="hover:text-white">
                Register Now
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Search Jobs
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Login
              </a>
            </li>
          </ul>
        </div>

        {/* Employers */}
        <div>
          <h4 className="text-white text-[16px] font-semibold mb-2">
            Employers
          </h4>
          <ul className="space-y-1 text-[14px]">
            <li>
              <a href="#" className="hover:text-white">
                Post a Job
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Advertise
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Quick Links + Logo beside it */}
        <div className="flex justify-between items-start">
          {/* Quick Links */}
          <div>
            <h4 className="text-white text-[16px] font-semibold mb-2">
              Quick Links
            </h4>

            <ul className="space-y-1 text-[14px]">
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Logo */}
          <div className="text-right">
            <img
              src={logo}
              alt="Interlink"
              className="w-[65px] opacity-90 ml-4"
            />
            <p className="text-[13px] text-white/70 mt-1">
              2025, Interlink.com
            </p>
          </div>
        </div>
      </div>

      {/* Social Icons */}
      <div className="flex justify-center gap-4 mt-6">
        <a className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
          <img src={facebook} className="w-[18px]" />
        </a>

        <a className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
          <img src={instagram} className="w-[18px]" />
        </a>

        <a className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
          <img src={whatsapp} className="w-[18px]" />
        </a>

        <a className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
          <img src={linkedin} className="w-[18px]" />
        </a>
      </div>
    </footer>
  );
}
