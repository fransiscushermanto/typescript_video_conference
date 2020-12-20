import * as React from "react";

function Info(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#prefix__clip0)">
        <path d="M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm0 22a10 10 0 1110-10 10.011 10.011 0 01-10 10z" />
        <path d="M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm0 22a10 10 0 1110-10 10.011 10.011 0 01-10 10z" />
        <path d="M12 10h-1a1 1 0 000 2h1v6a1 1 0 002 0v-6a2 2 0 00-2-2z" />
        <path d="M12 10h-1a1 1 0 000 2h1v6a1 1 0 002 0v-6a2 2 0 00-2-2zM12 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        <path d="M12 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </g>
      <defs>
        <clipPath id="prefix__clip0">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default Info;
