type FeatherFinderMarkProps = {
  showName?: boolean
  className?: string
}

export function FeatherFinderMark({ showName = true, className = '' }: FeatherFinderMarkProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${showName ? 'size-6' : 'size-7'} text-[#1d3b2a]`}
        aria-hidden
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M5.993 17.877Q6 17.937 6 18v3a1 1 0 0 1-2 0v-3C4 9.163 11.163 2 20 2c0 8.162-6.111 14.896-14.007 15.877m.174-2.044A14.01 14.01 0 0 0 17.833 4.167A14.01 14.01 0 0 0 6.167 15.833"
          clipRule="evenodd"
        />
      </svg>
      {showName && (
        <span className="font-kodchasan text-[19px] font-bold text-[#1d3b2a]">
          FeatherFinder
        </span>
      )}
    </div>
  )
}
