const calculateHours = (
  punchIn,
  punchOut
) => {
  if (
    !punchIn ||
    !punchOut
  )
    return 0;

  const diff =
    new Date(
      punchOut
    ).getTime() -
    new Date(
      punchIn
    ).getTime();

  return Number(
    (
      diff /
      (1000 *
        60 *
        60)
    ).toFixed(2)
  );
};

module.exports =
  calculateHours;