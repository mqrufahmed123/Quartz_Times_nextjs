export const CraftsmanshipSection = () => (
  <section id="quality" className="qt-section qt-quality scroll-mt-24">
    <div className="qt-container">
      <div className="qt-section-heading">
        <div>
          <h2>A little more confidence.</h2>
          <p>The details that make choosing easier.</p>
        </div>
      </div>
      <div className="qt-quality-grid">
        {[
          [
            "A closer look",
            "Product photos and details help you explore materials, finishing and condition.",
          ],
          [
            "The right details",
            "Compare watch specifications, footwear construction and garment fabrics.",
          ],
          [
            "Your size. Your style.",
            "Explore available sizes and colours, and ask us for help finding your fit.",
          ],
          [
            "A real conversation",
            "Message our team for extra photos, product videos and delivery information.",
          ],
        ].map(([title, description], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
