const banners = [
  {
    href: "/catalog",
    alt: "Khuyến mãi bên trái",
    className: "left-4",
    src: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/74/9b/749b641da4b3ca79a40cb52bf6b60448.png",
  },
  {
    href: "/catalog",
    alt: "Khuyến mãi bên phải",
    className: "right-4",
    src: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/74/9b/749b641da4b3ca79a40cb52bf6b60448.png",
  },
];

function SideBanners() {
  return (
    <>
      {banners.map((banner) => (
        <a
          key={banner.className}
          href={banner.href}
          className={`fixed top-32 z-40 hidden 2xl:block ${banner.className}`}
          aria-label={banner.alt}
        >
          <img
            src={banner.src}
            alt={banner.alt}
            className="w-[160px] rounded-md object-contain shadow-lg transition-transform duration-200 hover:scale-105"
            loading="lazy"
          />
        </a>
      ))}
    </>
  );
}

export default SideBanners;



