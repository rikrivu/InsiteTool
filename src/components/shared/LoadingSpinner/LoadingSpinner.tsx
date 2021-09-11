function LoadingSpinner ({size}: {size?: 'small' | 'large'}) {
    return (
        <div className={`lds-ring${size === 'small' ? ' ring-small' : ' ring-large'}`}>
            <div></div><div></div><div></div><div></div>
        </div>
    );
}

export default LoadingSpinner;