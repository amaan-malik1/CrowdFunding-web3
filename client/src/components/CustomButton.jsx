import React from 'react'

const CustomButton = ({ btnType, title, handleClick, styles, disabled = false }) => {
  return (
    <button
      type={btnType}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {title}
    </button>
  )
}

export default CustomButton
