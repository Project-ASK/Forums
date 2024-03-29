import { useRouter } from "next/router";
import { useEffect } from "react";

export default function removeScript(url) {
    const router = useRouter();

    useEffect(() => {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        document.body.appendChild(script);

        const onRouterChange = (newPath) => {
            window.location.href = router.basePath + newPath;
        };

        router.events.on("routeChangeStart", onRouterChange);

        return () => {
            router.events.off("routeChangeStart", onRouterChange);
            document.body.removeChild(script);
        };
    }, [router, url]);
}
