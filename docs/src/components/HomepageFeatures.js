import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Boost your Typescript code',
    Svg: require('../../static/img/undraw_outer_space.svg').default,
    description: (
      <>
        Rimbu has you covered for almost anything related to data loading,
        processing, state management, and querying in an efficient way.
      </>
    ),
  },
  {
    title: 'Immutability made easy',
    Svg: require('../../static/img/undraw_building_blocks.svg').default,
    description: (
      <>
        Immutable data structures have a reputation of being hard to use. Rimbu
        provides an easy and consistent API that is easy to learn and use.
      </>
    ),
  },
  {
    title: 'Leading the way',
    Svg: require('../../static/img/undraw_powerful.svg').default,
    description: (
      <>
        Rimbu incorporates many novel ideas, and intends to lead the way in
        allowing developers to write cleaner and safer code.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
