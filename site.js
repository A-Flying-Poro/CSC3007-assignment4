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
    const svgDefs = svg.append('defs');
    const tooltip = d3.select('#tooltip');

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



    // Legend
    const legendData = [
        {
            legendClass: 'data-female',
            label: 'Female'
        }, {
            legendClass: 'data-male',
            label: 'Male'
        }
    ]
    const legendColourSize = 25
    const legendInterMarginX = 5
    const legendInterMarginY = 5

    const svgLegend = svg.append('g')
        .attr('id', 'legend');

    const legendEntry = svgLegend.selectAll('g')
        .data(legendData)
        .enter()
        .append('g')
    legendEntry.append('rect')
        .attr('x', 0)
        .attr('y', (data, index) => (legendColourSize + legendInterMarginY) * index)
        .attr('width', legendColourSize)
        .attr('height', legendColourSize)
        .attr('class', d => d.legendClass)
    legendEntry.append('text')
        .attr('x', legendColourSize + legendInterMarginX)
        .attr('y', (data, index) => (legendColourSize + legendInterMarginY) * index + legendColourSize / 2)
        .attr('class', 'legend-label')
        .attr('text-anchor', 'left')
        .attr('alignment-baseline', 'middle')
        .text(d => d.label)
}
