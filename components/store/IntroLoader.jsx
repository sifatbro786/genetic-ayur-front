import { defaultSite } from "@/lib/defaults";

// Minimum time the intro stays up, as the client asked (3 to 4 seconds). It
// also waits for the page's load event, capped at MAX_MS so a slow network
// never traps the visitor. Shown once per browser session: most traffic comes
// from ads, and a second 3 s wait on every visit costs orders.
const MIN_MS = 3000;
const MAX_MS = 6000;

const script = `(function(){
var el=document.getElementById("ga-loader");if(!el)return;
try{if(sessionStorage.getItem("ga-intro"))return;sessionStorage.setItem("ga-intro","1")}catch(e){}
el.setAttribute("data-show","");
var start=Date.now(),done=false;
function finish(){if(done)return;done=true;
var wait=Math.max(0,${MIN_MS}-(Date.now()-start));
setTimeout(function(){el.setAttribute("data-done","");
setTimeout(function(){el.removeAttribute("data-show")},800)},wait)}
if(document.readyState==="complete")finish();else window.addEventListener("load",finish);
setTimeout(finish,${MAX_MS});
})();`;

// Server component: rendered into the HTML so it covers the page before the
// first paint. suppressHydrationWarning because the script adds data-show /
// data-done before React hydrates.
export default function IntroLoader() {
    return (
        <>
            <div
                id="ga-loader"
                role="status"
                aria-label="লোড হচ্ছে"
                suppressHydrationWarning
                style={{ "--ga-min": `${MIN_MS}ms` }}
                className="paper-grain fixed inset-0 z-[100] flex-col items-center justify-center bg-kagoj px-6"
            >
                <div className="relative w-56 sm:w-64">
                    {/* The hero's arch, drawn in gold, with the logo inside. */}
                    <svg viewBox="0 0 200 250" className="w-full" aria-hidden>
                        <path
                            className="ga-arch"
                            pathLength="1"
                            d="M10 245 V100 A90 90 0 0 1 190 100 V245 Z"
                            fill="none"
                            stroke="#d9a93a"
                            strokeWidth="2"
                        />
                        <path
                            className="ga-arch"
                            style={{ animationDelay: "0.35s" }}
                            pathLength="1"
                            d="M22 233 V100 A78 78 0 0 1 178 100 V233 Z"
                            fill="none"
                            stroke="#0a4d14"
                            strokeOpacity="0.35"
                            strokeWidth="1"
                        />
                    </svg>
                    <img
                        src={defaultSite.logo}
                        alt=""
                        className="ga-fade absolute left-1/2 top-[38%] w-[78%] -translate-x-1/2 -translate-y-1/2"
                        style={{ animationDelay: "0.8s" }}
                    />
                    <p
                        className="ga-fade absolute inset-x-0 bottom-[14%] text-center font-hand text-xl text-dalchini sm:text-2xl"
                        style={{ animationDelay: "1.3s" }}
                    >
                        প্রকৃতির যত্নে তৈরি
                    </p>
                </div>
                <div className="mt-8 h-0.5 w-40 overflow-hidden rounded-full bg-bon/10">
                    <div className="ga-bar h-full w-full bg-sona" />
                </div>
            </div>
            <script dangerouslySetInnerHTML={{ __html: script }} />
        </>
    );
}
