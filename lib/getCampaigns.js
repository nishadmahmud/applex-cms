

export const getCampaign = async (id,token) => {
  const res = await fetch(
    // eslint-disable-next-line no-undef
    `${process.env.NEXT_PUBLIC_API}/campaigns/${id}`,
    {
      next: { tags: "campaign" },
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  return data;
};
