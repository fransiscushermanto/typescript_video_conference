import * as React from "react";

function Close(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      fill="#2E4865"
      {...props}
    >
      <rect
        x={4.00012}
        y={14.9102}
        width={15.4276}
        height={1.54276}
        rx={0.771379}
        transform="rotate(-45 4.00012 14.9102)"
      />
      <rect
        x={14.9089}
        y={16}
        width={15.4276}
        height={1.54276}
        rx={0.771379}
        transform="rotate(-135 14.9089 16)"
      />
    </svg>
  );
}

export default Close;
