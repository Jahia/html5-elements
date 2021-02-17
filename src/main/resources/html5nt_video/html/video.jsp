<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>


<c:set var="autoplay" value="${currentNode.properties.autoplay.boolean}"/>
<c:set var="controls" value="${currentNode.properties.controls.boolean}"/>
<c:set var="fallbackContent" value="${currentNode.properties.fallbackContent.string}"/>
<c:set var="height" value="${currentNode.properties.height.string}"/>
<c:set var="loop" value="${currentNode.properties.loop.boolean}"/>
<c:set var="muted" value="${currentNode.properties.muted.boolean}"/>
<c:set var="poster" value="${currentNode.properties.poster}"/>
<c:set var="preload" value="${currentNode.properties.preload.string}"/>
<c:set var="source" value="${currentNode.properties.source}"/>
<jcr:nodeProperty node="${source.node}" name="jcr:mimeType" var="type" />
<c:set var="width" value="${currentNode.properties.width.string}"/>

<video 
       <c:if test="${autoplay}">autoplay </c:if>
       <c:if test="${controls}">controls </c:if>
       <c:if test="${loop}">loop </c:if>
       <c:if test="${muted}">muted </c:if>
       <c:if test="${not empty poster}">poster="${poster.node.url}" </c:if>
       <c:if test="${not empty preload}">preload="${fn:escapeXml(preload)}" </c:if>
       <c:if test="${not empty height}">height="${fn:escapeXml(height)}" </c:if>
       <c:if test="${not empty width}">width="${fn:escapeXml(width)}" </c:if>
       >
  <!--<source src="http://localhost:8080/files/live/sites/mySite/files/DXP%20Cloud%20Banner%20Video.mp4?lastModified=2021-02-16T16:33:36.926+01:00" type="">-->
  <source src="<c:url value='${source.node.url}'/>" type="${type}">
  ${fn:escapeXml(fallbackContent)}
</video>
