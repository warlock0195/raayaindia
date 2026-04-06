const Footer = () => {
  return (
    <footer className="mt-20 border-t border-black/10 bg-raayaBlack py-14 text-raayaIvory">
      <div className="section-container grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl tracking-[0.1em]">RAAYA INDIA</p>
          <p className="mt-3 max-w-xs text-sm text-raayaIvory/70">
            Timeless Indian luxury crafted for modern women who wear heritage with pride.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-[0.3em] text-raayaGold">Customer Care</h3>
          <ul className="space-y-2 text-sm text-raayaIvory/80">
            <li>Shipping & Returns</li>
            <li>Track Orders</li>
            <li>Support</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-[0.3em] text-raayaGold">Visit Us</h3>
          <p className="text-sm text-raayaIvory/80">
            Raaya India Atelier
            <br />
            New Delhi, India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
