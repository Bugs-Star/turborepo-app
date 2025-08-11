import Image from "next/image";

interface LogoProps {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ 
  title = "Bugs Star", 
  subtitle, 
  size = "md" 
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "w-16 h-16",
      image: "w-12 h-12",
      imageProps: { width: 48, height: 48 }
    },
    md: {
      container: "w-20 h-20",
      image: "w-16 h-16",
      imageProps: { width: 64, height: 64 }
    },
    lg: {
      container: "w-24 h-24",
      image: "w-20 h-20",
      imageProps: { width: 96, height: 96 }
    }
  };

  const { container, image, imageProps } = sizeClasses[size];

  return (
    <div className="text-center">
      <div className={`${container} rounded-full flex items-center justify-center mx-auto mb-2 overflow-hidden`}>
        <Image
          src="/images/logo.png"
          alt="Bugs Star Logo"
          {...imageProps}
          className={`${image} object-contain`}
        />
      </div>
      {title && (
        <h1 className="text-3xl font-bold text-green-700">{title}</h1>
      )}
      {subtitle && (
        <p className="text-xl text-gray-800">{subtitle}</p>
      )}
    </div>
  );
}
