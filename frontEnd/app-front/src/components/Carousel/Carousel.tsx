
import React, { useState } from "react";
import "./Carousel.css";

const images = [
	"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
	"https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
	"https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
];

const Carousel: React.FC = () => {
	const [current, setCurrent] = useState(0);
	const length = images.length;

	const nextSlide = () => {
		setCurrent(current === length - 1 ? 0 : current + 1);
	};

	const prevSlide = () => {
		setCurrent(current === 0 ? length - 1 : current - 1);
	};

	return (
		<div className="carousel-container">
			<button className="carousel-btn left" onClick={prevSlide}>&#10094;</button>
			<div className="carousel-slide">
				<img src={images[current]} alt={`slide-${current}`} className="carousel-image" />
			</div>
			<button className="carousel-btn right" onClick={nextSlide}>&#10095;</button>
			<div className="carousel-dots">
				{images.map((_, idx) => (
					<span
						key={idx}
						className={`carousel-dot${idx === current ? " active" : ""}`}
						onClick={() => setCurrent(idx)}
					/>
				))}
			</div>
		</div>
	);
};

export default Carousel;



