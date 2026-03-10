import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

interface Banner {
    id: string;
    title: string;
    image: string;
    linkUrl?: string;
}

interface BannerSliderProps {
    banners: Banner[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
    if (!banners || banners.length === 0) return null;

    return (
        <div className="w-full relative group">
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                effect="fade"
                spaceBetween={0}
                slidesPerView={1}
                centeredSlides={true}
                loop={true}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                navigation={true}
                className="banner-swiper rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <a
                            href={banner.linkUrl || '#'}
                            className="block relative aspect-[21/9] md:aspect-[3/1] w-full group overflow-hidden"
                        >
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent flex flex-col justify-end p-6 md:p-12">
                                <h3 className="font-heading text-white text-2xl md:text-4xl lg:text-5xl drop-shadow-lg max-w-2xl leading-[1.1]">
                                    {banner.title}
                                </h3>
                                {banner.linkUrl && (
                                    <div className="mt-4 md:mt-6">
                                        <span className="btn-mint text-xs md:text-sm px-6 py-2.5">Cek Promo ➔</span>
                                    </div>
                                )}
                            </div>
                        </a>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
                .banner-swiper .swiper-pagination-bullet {
                    background: rgba(56, 217, 245, 0.3);
                    opacity: 1;
                    width: 8px;
                    height: 8px;
                    transition: all 0.3s;
                }
                .banner-swiper .swiper-pagination-bullet-active {
                    background: #38D9F5;
                    width: 24px;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(56, 217, 245, 0.6);
                }
                .banner-swiper .swiper-button-next,
                .banner-swiper .swiper-button-prev {
                    color: white;
                    background: rgba(2, 8, 24, 0.4);
                    backdrop-filter: blur(4px);
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.3s;
                    opacity: 0;
                }
                .group:hover .banner-swiper .swiper-button-next,
                .group:hover .banner-swiper .swiper-button-prev {
                    opacity: 1;
                }
                .banner-swiper .swiper-button-next:after,
                .banner-swiper .swiper-button-prev:after {
                    font-size: 18px;
                    font-weight: bold;
                }
                .banner-swiper .swiper-button-next:hover,
                .banner-swiper .swiper-button-prev:hover {
                    background: #38D9F5;
                    color: #020818;
                    border-color: #38D9F5;
                }
            `}</style>
        </div>
    );
};

export default BannerSlider;
