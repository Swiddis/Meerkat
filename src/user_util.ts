export const getAttribute = (user, attribute) => {
	for (const attrib of (user.Attributes ? user.Attributes : user.UserAttributes)) {
		if (attrib.Name == attribute)
			return attrib.Value;
	}

	return null;
};