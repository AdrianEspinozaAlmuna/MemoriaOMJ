import React, { useEffect, useState } from "react";
import { getTest } from "../services/userService";

export default function Home() {
  const [data, setData] = useState(null);
  useEffect(() => {
    getTest().then(setData).catch(err => setData({ error: err.message }));
  }, []);
  return (
    <div>
      <h2>Home</h2>
      <pre>{data ? JSON.stringify(data, null, 2) : "Cargando..."}</pre>
    </div>
  );
}