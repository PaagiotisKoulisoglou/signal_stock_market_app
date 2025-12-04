'use client';

import TradingViewWidget from "@/components/TradingViewWidget";
import { useParams } from "next/navigation";

const StockDetailsPage = () => {
    const params = useParams() as { symbol?: string | string[] };
    const raw = Array.isArray(params?.symbol) ? params.symbol[0] : (params?.symbol || "");
    const symbol = decodeURIComponent(raw).toUpperCase() || "AAPL";
    const qualified = symbol.includes(":") ? symbol : `NASDAQ:${symbol}`;
    const scriptBase = "https://s3.tradingview.com/external-embedding/embed-widget-";

    return (
        <div className="flex min-h-screen home-wrapper">
            <section className="grid w-full gap-8 home-section">
                <div className="md:col-span-2 xl:col-span-2">
                    <div className="rounded-lg border border-gray-800 bg-[#0F0F0F] p-3">
                        <TradingViewWidget
                            title={`${symbol} Overview Chart`}
                            scriptUrl={`${scriptBase}symbol-overview.js`}
                            config={{
                                symbols: [[symbol, `${qualified}|1D`]],
                                chartType: "area",
                                lineWidth: 2,
                                colorTheme: "dark",
                                isTransparent: true,
                                autosize: true,
                                locale: "en",
                                width: "100%",
                                height: 420,
                                dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
                                noTimeScale: false,
                                hideDateRanges: false,
                                hideMarketStatus: false,
                                hideSymbolLogo: false,
                            }}
                            height={420}
                        />
                    </div>
                </div>

                <div className="md:col-span-1 xl:col-span-1">
                    <div className="rounded-lg border border-gray-800 bg-[#0F0F0F] p-3">
                        <TradingViewWidget
                            title="Technical Analysis"
                            scriptUrl={`${scriptBase}technical-analysis.js`}
                            config={{
                                colorTheme: "dark",
                                displayMode: "single",
                                isTransparent: true,
                                locale: "en",
                                interval: "1h",
                                disableInterval: false,
                                width: "100%",
                                height: 420,
                                symbol: qualified,
                                showIntervalTabs: true,
                            }}
                            height={420}
                        />
                    </div>
                </div>
            </section>

            <section className="grid w-full gap-8 home-section">

                <div className="md:col-span-1 xl:col-span-1">
                    <div className="rounded-lg border border-gray-800 bg-[#0F0F0F] p-3">
                        <TradingViewWidget
                            title="Company Profile"
                            scriptUrl={`${scriptBase}symbol-profile.js`}
                            config={{
                                symbol: qualified,
                                colorTheme: "dark",
                                isTransparent: true,
                                locale: "en",
                                width: "100%",
                                height: 460,
                            }}
                            height={460}
                        />
                    </div>
                </div>
                <div className="md:col-span-2 xl:col-span-2">
                    <div className="rounded-lg border border-gray-800 bg-[#0F0F0F] p-3">
                        <TradingViewWidget
                            title="Latest News"
                            scriptUrl={`${scriptBase}timeline.js`}
                            config={{
                                displayMode: "regular",
                                feedMode: "symbol",
                                symbol: qualified,
                                colorTheme: "dark",
                                isTransparent: true,
                                locale: "en",
                                width: "100%",
                                height: 460,
                            }}
                            height={460}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default StockDetailsPage;
