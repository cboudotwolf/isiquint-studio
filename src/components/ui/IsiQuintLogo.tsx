import Image from "next/image";

interface IsiQuintLogoProps {
  className?: string;
  height?: number;
}

export default function IsiQuintLogo({ className = "", height = 40 }: IsiQuintLogoProps) {
  return (
    <Image
      src="/isiquint-logo.png"
      alt="isiQuint"
      width={height * 6}
      height={height}
      className={className}
      priority
    />
  );
}
