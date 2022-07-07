document.addEventListener('DOMContentLoaded', (event) => {
    onLoad().catch(console.log)
});

async function onLoad() {
    const viewBoxHeight = 600
    const viewBoxWidth = 860
    const marginX = 50
    const marginY = 50
    const height = viewBoxHeight - marginY * 2
    const width = viewBoxWidth - marginX * 2

    const svg = d3.select('#dataChart')
        .append('svg')
        .attr('viewBox', [0, 0, viewBoxWidth, viewBoxHeight])
        .append('g')
        .attr('transform', `translate(${marginX}, ${marginY})`);
    // const svgDefs = svg.append('defs');
    const tooltip = d3.select('#tooltip');
    // const tooltipAreaName = tooltip.select('#tooltipAreaName');
    // const tooltipPopulation = tooltip.select('#tooltipPopulation');
    // const colours = ['pink', 'cyan'];
    const colourLegend = ['female', 'male'];
    /*function getColour(gender) {
        const index = colourLegend.indexOf(gender);
        if (index < 0)
            return '';
        else
            return colours[index];
    }*/

    const [dataCasesJson, dataLinksJson] = await Promise.all([
        d3.json('./data/cases.json'),
        d3.json('./data/links.json'),
    ]);

    for (const link of dataLinksJson) {
        link.source = link.infector
        link.target = link.infectee
    }

    const svgNodes = svg.append('g')
        .attr('id', 'nodes')
        .selectAll('circle')
        .data(dataCasesJson)
        .enter()
        .append('circle')
        .attr('r', 25)
        .attr('class', data => ['node', `data-${data.gender}`].join(' '))
        // .attr('fill', data => getColour(data.gender))
        .call(d3.drag()
            .on('start', (event, data) => {
                if (!event.active)
                    forceSimulation.alphaTarget(0.3).restart();
                data.fx = data.x;
                data.fy = data.y;
            })
            .on('drag', (event, data) => {
                data.fx = event.x;
                data.fy = event.y;
            })
            .on('end', (event, data) => {
                if (!event.active)
                    forceSimulation.alphaTarget(0)
                data.fx = null;
                data.fy = null;
            })
        )
        .on('mouseover', (event, data) => {
            tooltip.style('opacity', 1);
            d3.selectAll(`span[data-json-key]`)
                .each(function (d) {
                    const span = d3.select(this)
                    span.text(data[span.attr('data-json-key')])
                })
        })
        .on('mousemove', (event, data) => {
            tooltip
                .style('left', `${event.pageX + 20}px`)
                .style('top', `${event.pageY - 20}px`)
        })
        .on('mouseleave', (event, data) => {
            tooltip.style('opacity', 0)
                .style('left', null)
                .style('top', null);
        })
    const svgLinks = svg.append('g')
        .attr('id', 'links')
        .selectAll('path')
        .data(dataLinksJson)
        .enter()
        .append('path')
        .attr('class', 'link')

    const forceSimulation = d3.forceSimulation()
        .nodes(dataCasesJson)
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('x', d3.forceX().strength(0.1).x(width / 2))
        .force('y', d3.forceY().strength(0.1).y(height / 2))
        .force('charge', d3.forceManyBody().strength(-50))
        .force('collide', d3.forceCollide().strength(0.5).radius(40))
        .force('link', d3.forceLink(dataLinksJson)
            .id(data => data.id)
            .distance(20)
            .strength(1))
        // .alphaMin(simulationAlpha)
        .on('tick', d => {
            svgNodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)

            svgLinks
                .attr('d', data => `M${data.source.x},${data.source.y} ${data.target.x},${data.target.y}`)
        })





    // const [mapJson, populationData] = await Promise.all([
    //     d3.json('./data/sgmap.json'),
    //     d3.csv('./data/population2021.csv', (data) => ({
    //         subzone: data["Subzone"],
    //         planningArea: data["Planning Area"],
    //         population: +data["Population"] || 0
    //     })),
    // ]);
    //
    // const highestPopulation = populationData.map(d => d.population).reduce((previousResult, currentValue) => Math.max(previousResult, currentValue));
    // const colourScale = d3.scaleSequential().domain([0, highestPopulation])
    //     .interpolator(d3.interpolatePurples);
    //
    // const mapProjection = d3.geoMercator()
    //     .center([103.851959, 1.290270])
    //     .fitExtent([[marginX, marginY], [width, height]], mapJson);
    // const geoPath = d3.geoPath().projection(mapProjection);
    //
    // /** @type {Map<string, number>} */
    // const populationMap = populationData.reduce((previousResult, currentValue) => previousResult.set(currentValue.subzone.toUpperCase(), currentValue.population),
    //     new Map());
    //
    // svg.append('g')
    //     .attr('id', 'districts')
    //     .selectAll('path')
    //     .data(mapJson.features)
    //     .enter()
    //     .append('path')
    //     .attr('class', 'map-area')
    //     .attr('d', geoPath)
    //     .attr('fill', (data) => {
    //         data.population = populationMap.has(data.properties.Name) ? populationMap.get(data.properties.Name) : 0;
    //         return colourScale(data.population);
    //     })
    //     .on('mouseover', (event, data) => {
    //         tooltipAreaName.text(data.properties.Name);
    //         tooltipPopulation.text(data.population.toLocaleString());
    //         tooltip.style('opacity', 1);
    //     })
    //     .on('mousemove', (event, data) => {
    //         tooltip
    //             .style('left', `${event.pageX + 20}px`)
    //             .style('top', `${event.pageY - 20}px`)
    //     })
    //     .on('mouseleave', (event, data) => {
    //         tooltip.style('opacity', 0)
    //             .style('left', null)
    //             .style('top', null);
    //     })
    //
    //
    //
    // // Legend
    // const svgDefLinearGradientLegend = svgDefs.append('linearGradient')
    //     .attr('id', 'legendGradient')
    //     .attr('x1', '0%').attr('y1', '0%')
    //     .attr('x2', '0%').attr('y2', '100%');
    // svgDefLinearGradientLegend.append('stop')
    //     .attr('offset', '0%')
    //     .attr('stop-color', colourScale(0))
    //     .attr('stop-opacity', 1);
    // svgDefLinearGradientLegend.append('stop')
    //     .attr('offset', '100%')
    //     .attr('stop-color', colourScale(highestPopulation))
    //     .attr('stop-opacity', 1);
    //
    // const legendWidth = 25
    // const legendHeight = 150
    // const legendMarginX = 20
    // const legendMarginY = 20
    //
    // const legendTitleHeight = 10
    // const legendInterMarginX = 5
    // const legendInterMarginY = 5
    //
    // const svgLegend = svg.append('g')
    //     .attr('id', 'legend')
    //     .attr('transform', `translate(${legendMarginX}, ${legendMarginY})`);
    //
    // svgLegend.append('text')
    //     .attr('id', 'legendTitle')
    //     .attr('class', 'legend-title')
    //     .text('Population');
    //
    // const svgLegendColour = svgLegend.append('rect')
    //     .attr('id', 'legendColour')
    //     .attr('width', legendWidth)
    //     .attr('height', legendHeight)
    //     .attr('y', legendTitleHeight + legendInterMarginY)
    //     .attr('fill', 'url(#legendGradient)');
    //
    // const legendAxis = d3.axisRight()
    //     .scale(d3.scaleLinear()
    //         .domain([0, highestPopulation])
    //         .range([0, legendHeight]))
    //     .tickSize(6)
    //     .ticks(8);
    // svgLegend.append('g')
    //     .attr('id', 'legendAxis')
    //     .attr('transform', `translate(${legendWidth + legendInterMarginX}, ${legendTitleHeight + legendInterMarginY})`)
    //     .call(legendAxis);
}
