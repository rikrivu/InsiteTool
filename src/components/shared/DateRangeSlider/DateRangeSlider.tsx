import { CSSProperties } from 'react';
import { Slider, Rail, Handles, Tracks, Ticks, GetRailProps, SliderItem, TrackItem } from 'react-compound-slider';
import { SliderRail, Handle, Track, Tick } from './dateRangeComponents'; // example render components - source below
import { GetHandleProps } from 'react-compound-slider/dist/types/Handles/types';
import { GetTrackProps } from 'react-compound-slider/dist/types/Tracks/types';
import { DateRangeSliderProps } from './DateRangeSliderModels';
import { formatTick } from '../../../utils/globalUtilityMethods';

const sliderStyle: CSSProperties = {
  position: "relative",
  width: "100%"
};

function DateRangeSlider (
  {
    today,
    domainStart,
    step,
    dateTicks,
    startDate,
    endDate,
    onDateRangeChange
  }: DateRangeSliderProps
) {

  return (
    <div className="slider-container">
      <Slider
        mode={3}
        step={step}
        domain={[+ domainStart, + today]}
        rootStyle={sliderStyle}
        onChange={([sd, ed]: readonly number[]) => {
          onDateRangeChange([new Date(sd), new Date(ed)])
        }}
        values={[+ startDate, + endDate]}
      >
        <Rail>
          {({ getRailProps }: {getRailProps: GetRailProps}) => <SliderRail getRailProps={getRailProps} />}
        </Rail>

        <Handles>
          {({ handles, getHandleProps }: {handles: SliderItem[], getHandleProps: GetHandleProps}) => (
            <div>
              {handles.map(handle => (
                <Handle
                  key={handle.id}
                  handle={handle}
                  domain={[+ domainStart, + today]}
                  getHandleProps={getHandleProps}
                />
              ))}
            </div>
          )}
        </Handles>

        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }: { tracks: TrackItem[], getTrackProps: GetTrackProps }) => (
            <div>
              {tracks.map(({ id, source, target }: { id: string, source: SliderItem, target: SliderItem }) => (
                <Track
                  key={id}
                  source={source}
                  target={target}
                  getTrackProps={getTrackProps}
                />
              ))}
            </div>
          )}
        </Tracks>

        <Ticks values={dateTicks}>
          {({ ticks }: { ticks: SliderItem[] }) => (
            <div>
              {ticks.map(tick => (
                <Tick
                  key={tick.id}
                  tick={tick}
                  count={ticks.length}
                  format={formatTick}
                />
              ))}
            </div>
          )}
        </Ticks>

      </Slider>
    </div>
  );
}

export default DateRangeSlider;