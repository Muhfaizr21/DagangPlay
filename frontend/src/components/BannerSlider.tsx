import React from 'react';
import { ChevronRight } from 'lucide-react';
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
    theme?: 'dark' | 'light';
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners, theme = 'dark' }) => {
    if (!banners || banners.length === 0) return null;

    const isLight = theme === 'light';

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
                className={`banner-swiper rounded-[2rem] overflow-hidden ${isLight ? 'shadow-2xl shadow-indigo-100' : 'shadow-2xl shadow-black/50 border border-white/5'}`}
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <a
                            href={banner.linkUrl || '#'}
                            className="block relative aspect-[21/9] md:aspect-[2.5/1] w-full group overflow-hidden"
                        >
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay Gradient */}
                            <div className={`absolute inset-0 flex flex-col justify-end p-6 md:p-14 ${isLight
                                ? 'bg-gradient-to-t from-white/90 via-white/20 to-transparent'
                                : 'bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent'
                                }`}>
                                <h3 className={`font-black italic uppercase tracking-tighter text-2xl md:text-5xl lg:text-6xl max-w-3xl leading-[0.9] drop-shadow-sm ${isLight ? 'text-indigo-950' : 'text-white'
                                    }`}>
                                    {banner.title}
                                </h3>
                                {banner.linkUrl && (
                                    <div className="mt-6 md:mt-10">
                                        <span className={`${isLight ? 'bg-indigo-600 text-white' : 'btn-mint'} text-[10px] md:text-xs font-black uppercase tracking-widest px-8 py-3 rounded-full flex items-center gap-2 max-w-max italic shadow-xl h-max`}>
                                            Kunjungi Promo <ChevronRight size={14} />
                                        </span>
                                    </div>
                                )}
                            </div>
                        </a>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
                .banner-swiper .swiper-pagination-bullet {
                    background: ${isLight ? '#6366f133' : 'rgba(56, 217, 245, 0.3)'};
                    opacity: 1;
                    width: 10px;
                    height: 10px;
                    transition: all 0.3s;
                }
                .banner-swiper .swiper-pagination-bullet-active {
                    background: ${isLight ? '#6366f1' : '#38D9F5'};
                    width: 32px;
                    border-radius: 5px;
                    box-shadow: 0 0 15px ${isLight ? 'rgba(99, 102, 241, 0.5)' : 'rgba(56, 217, 245, 0.6)'};
                }
                .banner-swiper .swiper-button-next,
                .banner-swiper .swiper-button-prev {
                    color: ${isLight ? '#4f46e5' : 'white'};
                    background: ${isLight ? 'rgba(255,255,255,0.8)' : 'rgba(2, 8, 24, 0.4)'};
                    backdrop-filter: blur(8px);
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: 1px solid ${isLight ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.1)'};
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    opacity: 0;
                    margin: 0 20px;
                }
                .group:hover .banner-swiper .swiper-button-next,
                .group:hover .banner-swiper .swiper-button-prev {
                    opacity: 1;
                }
                .banner-swiper .swiper-button-next:after,
                .banner-swiper .swiper-button-prev:after {
                    font-size: 20px;
                    font-weight: 900;
                }
                .banner-swiper .swiper-button-next:hover,
                .banner-swiper .swiper-button-prev:hover {
                    background: ${isLight ? '#4f46e5' : '#38D9F5'};
                    color: ${isLight ? 'white' : '#020818'};
                    transform: scale(1.1);
                    box-shadow: 0 10px 20px -5px ${isLight ? 'rgba(79, 70, 229, 0.4)' : 'rgba(56, 217, 245, 0.4)'};
                }
            `}</style>
        </div>
    );
};

export default BannerSlider;
