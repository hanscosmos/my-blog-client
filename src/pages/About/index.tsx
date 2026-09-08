import { useEffect, useState } from "react";
import { Card, Skeleton } from "antd";
import { getBloggerProfileApi } from "@/api/blogger";

export default function About() {
  const [introduction, setIntroduction] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBloggerProfileApi()
      .then((res) => setIntroduction(res.introduction))
      .catch(() => {
        // ignore
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 px-4">
      <Card
        title="关于博主"
        className="bg-container border border-border rounded-xl"
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <p className="text-sm leading-relaxed text-text whitespace-pre-wrap">
            {introduction || "博主还没有填写简介～"}
          </p>
        )}
      </Card>
    </div>
  );
}
