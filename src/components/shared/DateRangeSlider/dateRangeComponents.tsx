// @flow weak

import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { GetHandleProps, GetRailProps, GetTrackProps, SliderItem } from 'react-compound-slider';
import './DateRangeSlider.scss';

// *******************************************************
// RAIL
// *******************************************************
export function SliderRail({ getRailProps }: {getRailProps: GetRailProps}) {
  return (
    <Fragment>
      <div className="slider-rail-outer" {...getRailProps()} />
      <div className="slider-rail-inner"/>
    </Fragment>
  );
}

SliderRail.propTypes = {
  getRailProps: PropTypes.func.isRequired
};
// *******************************************************
// RAIL ENDS
// *******************************************************

// *******************************************************
// HANDLE COMPONENT
// *******************************************************
export function Handle({
  domain: [min, max],
  handle: { id, value, percent },
  getHandleProps,
  disabled
}: {domain: readonly number[], handle: SliderItem, disabled: boolean, getHandleProps: GetHandleProps}) {
  return (
    <Fragment>
      <div
        className="handle"
        style={{left: `${percent}%`}}
        {...getHandleProps(id)}
      />
      <div
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="handle-slider"
        style={{
          left: `${percent}%`,
          backgroundColor: disabled ? "#666" : "#333"
        }}
      />
    </Fragment>
  );
}

Handle.propTypes = {
  domain: PropTypes.array.isRequired,
  handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  getHandleProps: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

Handle.defaultProps = {
  disabled: false
};
// *******************************************************
// HANDLE COMPONENT ENDS
// *******************************************************

// *******************************************************
// TRACK COMPONENT
// *******************************************************
export function Track(
  {
    source,
    target,
    getTrackProps,
    disabled
  }: { source: SliderItem, target: SliderItem, getTrackProps: GetTrackProps, disabled: boolean }
) {
  return (
    <div
      className="track"
      style={{
        backgroundColor: disabled ? "#999" : "#444",
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`
      }}
      {...getTrackProps()}
    />
  );
}

Track.propTypes = {
  source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  target: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  getTrackProps: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

Track.defaultProps = {
  disabled: false
};
// *******************************************************
// TRACK COMPONENT ENDS
// *******************************************************

// *******************************************************
// TICK COMPONENT
// *******************************************************
export function Tick(
    { tick, count, format }: { tick: SliderItem, count: number, format: (ms: string | number | Date) => string }
) {
  return (
    <div>
      <div
        className="tick-line"
        style={{left: `${tick.percent}%`}}
      />
      <div
        className="tick-label"
        style={{
          marginLeft: `${-(100 / count) / 2}%`,
          width: `${100 / count}%`,
          left: `${tick.percent}%`
        }}
      >
        {format(tick.value)}
      </div>
    </div>
  );
}

Tick.propTypes = {
  tick: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  count: PropTypes.number.isRequired,
  format: PropTypes.func.isRequired
};

Tick.defaultProps = {
  format: (d: any) => d
};
// *******************************************************
// TICK COMPONENT ENDS
// *******************************************************
