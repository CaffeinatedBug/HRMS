const calculateSalary = ({
  basicSalary,
  allowances = 0,
  bonus = 0,
  deductions = 0,
}) => {
  return (
    Number(
      basicSalary
    ) +
    Number(
      allowances
    ) +
    Number(
      bonus
    ) -
    Number(
      deductions
    )
  );
};

module.exports =
  calculateSalary;