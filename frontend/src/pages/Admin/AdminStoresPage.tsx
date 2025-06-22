import { useEffect, useState } from "react";
import { storeApi } from "../../api/axios";

const AdminStoresPage = () => {
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await storeApi.get("/stores");
      setStores(data);
    };
    fetch();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Tiendas registradas</h1>
      <ul>
        {stores.map((s) => (
          <li key={s.id} className="border-b py-2">{s.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminStoresPage;