import { useHistory, useParams } from "react-router-dom";
import { getUserPatchesRoute } from "constants/routes";

export const UserPatchesRedirect: React.FC = () => {
  const router = useHistory();
  const { id } = useParams<{ id: string }>();
  router.push(getUserPatchesRoute(id));
  return null;
};
