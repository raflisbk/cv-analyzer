import Image from "next/image";

export default function PlaneIcon({ size }: { size: number }) {
  return (
    <Image
      src="/landing/3d/paper-plane.webp"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
    />
  );
}
