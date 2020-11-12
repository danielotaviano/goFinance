const FormatDate = (date: Date): string => {
  const dateString = date.toString();
  const formatedDate = Intl.DateTimeFormat('pt-BR').format(
    Date.parse(dateString),
  );
  return formatedDate;
};

export default FormatDate;
