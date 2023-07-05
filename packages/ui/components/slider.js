import React from 'react';
import Slider from 'react-slick';
import PropTypes from 'prop-types';
import styles from '../styles/slider.module.scss';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Card from '../components/common/card';

export default function SliderComponent({ projects = [] }) {
  const sliderHandle = React.useRef(null);
  const handleKeyDown = (e, direction) => {
    if (e.keyCode === 13) {
      if (direction === 'next') {
        sliderHandle.current.slickNext();
      } else {
        sliderHandle.current.slickPrev();
      }
    }
  };

  const Prev = ({ onClick, className }) => (
    <div
      role="button"
      tabIndex="0"
      aria-label="Previous"
      onKeyDown={(e) => handleKeyDown(e, 'prev')}
      onClick={onClick}
      className={[className, styles.arrow, styles.prev].join(' ')}></div>
  );
  const Next = ({ onClick, className }) => (
    <div
      role="button"
      tabIndex="0"
      aria-label="Next"
      onKeyDown={(e) => handleKeyDown(e, 'next')}
      onClick={onClick}
      className={[className, styles.arrow, styles.next].join(' ')}></div>
  );

  Prev.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func
  };

  Next.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func
  };

  var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <Next />,
    prevArrow: <Prev />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const getSlides = () => {
    return projects.map((project) => (
      // <div className={styles.project} style={{marginRight: '2rem'}} key={project.id}>
      //   <Card data={project} />
      // </div>
      <div className={styles.projectItemContainer} key={project}>
        <Card data={project} />
      </div>
      // <div className={styles.projectItemContainer} key={item}>
      //   <div className={styles.projectItem}>
      //     <figure>
      //       <img src="/assets/images/slider-img1.png" alt="Trulli" />
      //     </figure>
      //     <div className={styles.content}>
      //       <h3>Fig1. - Trulli, Puglia, Italy.</h3>
      //       <p>
      //         Ut bibendum sagittis nibh, eget finibus sapien ornare sed. Mauris eget elit pharetra
      //         neque dictum bibendum at vestibulum sapien. Proin sodales, ex ac ornare hendrerit,
      //         nulla nisl semper leo{' '}
      //       </p>
      //       <h4>Cambridge University</h4>
      //     </div>
      //     <div className={styles.footer}>
      //       <span className={styles.text}>Goal</span>
      //       <span className={styles.contribution}>$25,000</span>
      //     </div>
      //   </div>
      // </div>
    ));
  };

  return (
    <div className={styles.sliderOuterContainer}>
      <div className={[styles.sliderSection, 'container'].join(' ')}>
        <Slider ref={sliderHandle} {...settings}>
          {getSlides()}
        </Slider>
      </div>
    </div>
  );
}

SliderComponent.propTypes = {
  projects: PropTypes.array
};
