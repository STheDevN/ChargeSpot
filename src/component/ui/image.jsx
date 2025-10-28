export function Image({ src, alt, width, height, className = "", ...props }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}