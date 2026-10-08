export const serializeUser = (user) => {
  const data = user.get({ plain: true });
  delete data.password;
  return data;
};
