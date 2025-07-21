function CombineQualitiesIdNames(screenings){ 
    return screenings.map((screening) => {
        // console.log(screening)
        if (!screening.qualities_ids || !screening.qualities_names) {
            return { ...screening, qualities: null };
        }
        const ids = screening.qualities_ids.split(';');
        const names = screening.qualities_names.split(';');
        const qualitiesArr = ids.map((id, i) => ({
            quality_id: Number(id),
            quality_name: names[i]
        }));
        return { ...screening, qualities: qualitiesArr};
    });
}

export default CombineQualitiesIdNames;
