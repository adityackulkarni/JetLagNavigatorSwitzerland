import { useStore } from "@nanostores/react";
import { ArrowRight, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import {
    additionalMapGeoLocations,
    mapGeoJSON,
    mapGeoLocation,
    polyGeoJSON,
    questions,
} from "@/lib/context";
import { determineName, geocode, type OpenStreetMap } from "@/maps/api";

export const StartScreen = () => {
    const location = useStore(mapGeoLocation);
    const [started, setStarted] = useState(false);
    const [query, setQuery] = useState(determineName(location));
    const [results, setResults] = useState<OpenStreetMap[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (query.trim().length < 2 || query === determineName(location)) {
            setResults([]);
            return;
        }

        const timer = window.setTimeout(() => {
            setSearching(true);
            geocode(query, "en")
                .then(setResults)
                .catch(() => setResults([]))
                .finally(() => setSearching(false));
        }, 350);

        return () => window.clearTimeout(timer);
    }, [query, location]);

    const selectLocation = (result: OpenStreetMap) => {
        mapGeoLocation.set(result);
        additionalMapGeoLocations.set([]);
        mapGeoJSON.set(null);
        polyGeoJSON.set(null);
        questions.set([...questions.get()]);
        setQuery(determineName(result));
        setResults([]);
    };

    if (started) return null;

    return (
        <div className="jetlag-start-screen" role="dialog" aria-modal="true">
            <div className="jetlag-start-glow" />
            <div className="jetlag-start-content">
                <div className="jetlag-start-logo" aria-label="Jet Lag The Game">
                    <div>
                        <strong><span>JET</span> LAGG</strong>
                    </div>
                </div>
                <p className="jetlag-start-kicker">HIDE + SEEK</p>
                <h1>Where are you playing?</h1>
                <p className="jetlag-start-copy">
                    Pick the city or region where your game begins. Your map will
                    open there with the original investigation tools ready.
                </p>
                <div className="jetlag-start-picker">
                    <MapPin aria-hidden="true" />
                    <div className="jetlag-start-search">
                        <input
                            aria-label="Where are you playing?"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onFocus={(event) => event.currentTarget.select()}
                            onClick={(event) => event.currentTarget.select()}
                            placeholder="Zurich, Switzerland"
                        />
                        {(searching || results.length > 0) && (
                            <div className="jetlag-start-results">
                                {searching && (
                                    <div className="jetlag-start-result-muted">
                                        Searching places...
                                    </div>
                                )}
                                {results.map((result) => (
                                    <button
                                        key={`${result.properties.osm_id}-${result.properties.name}`}
                                        onClick={() => selectLocation(result)}
                                    >
                                        {determineName(result)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button className="jetlag-start-button" onClick={() => setStarted(true)}>
                    Start in {determineName(location)}
                    <ArrowRight aria-hidden="true" />
                </button>
                <p className="jetlag-start-note">
                    Type a place, choose a result, and begin the hunt.
                </p>
            </div>
        </div>
    );
};
